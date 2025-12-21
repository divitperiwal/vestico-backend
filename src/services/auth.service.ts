import { generateCsrfToken, generateSessionId } from '@/utils/tokenGeneration.js';
import { SESSION_DURATION_MS } from '@/constant.js';
import {
  deleteSession,
  getOldSessionByUserId,
  getSession,
  getUserWithPassword,
  initializeBrokerCredentials,
  registerUserData,
  saveSession,
} from '@/database/auth.database.js';
import { ApiError } from '@/utils/ApiError.js';
import { comparePassword, hashPassword } from '@/utils/hashing.js';
import { createCsrfCookie, createSessionCookie } from '@/utils/cookies.js';
import {
  getSessionFromCache,
  revokeSessionInCache,
  storeSessionInCache,
} from './redis/session.service.js';
import { getProfileFromCache, saveProfileToCache } from './redis/profile.service.js';
import { getUser } from '@/database/user.database.js';

export const validateSession = async (sessionId: string) => {
  //Check if session exists in redis
  const session = await getSessionFromCache(sessionId);
  if (!session) throw new ApiError('Invalid Session', 401);

  let userData = await getProfileFromCache(session.userId);
  if (!userData) {
    userData = await getUser(session.userId);
    if (!userData) throw new ApiError('User not found', 404);
    await saveProfileToCache(userData.userId, userData);
  }
  return { ...userData, sessionId };
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) throw new ApiError('Email and Password are required', 400);
  const user = await getUserWithPassword(email);
  if (!user) throw new ApiError('Invalid Credentials', 401);

  //Check user's password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new ApiError('Invalid Credentials', 401);

  //Delete any old session of user if exists

  const oldSession = await getOldSessionByUserId(user.userId);
  if (oldSession) {
    await Promise.allSettled([
      revokeSessionInCache(oldSession.sessionId),
      deleteSession(oldSession.sessionId),
    ]);
  }
  //Create new session for the user
  const { sessionId, expiresAt } = await createSession(user.userId);
  //Store in Redis
  await storeSessionInCache(sessionId, user.userId, user.role, expiresAt);
  //Generate CSRF Token
  const csrfToken = generateCsrfToken();
  //Create User Data Object
  const userData = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  //Cookies
  const sessionCookie = createSessionCookie(sessionId);
  const csrfCookie = createCsrfCookie(csrfToken);

  return { sessionCookie, csrfCookie, user: userData };
};

export const registerUser = async (email: string, password: string, name: string) => {
  if (!email || !password || !name)
    throw new ApiError('Email, Password and Name are required', 400);

  //Check if user already exists
  const existingUser = await getUserWithPassword(email);
  if (existingUser) throw new ApiError('User already exists', 409);

  const passwordHash = await hashPassword(password);
  const user = await registerUserData(email, passwordHash, name);
  //Initialize Broker Credentials for the user
  await initializeBrokerCredentials(user.userId);

  //Create new session for the user
  const { sessionId, expiresAt } = await createSession(user.userId);
  const csrfToken = generateCsrfToken();

  //Store in Redis
  await storeSessionInCache(sessionId, user.userId, user.role, expiresAt);

  //Cookies
  const csrfCookie = createCsrfCookie(csrfToken);
  const sessionCookie = createSessionCookie(sessionId);

  return { sessionCookie, csrfCookie, user };
};

export const logoutUser = async (sessionId: string) => {
  if (!sessionId) throw new ApiError('Session ID is required', 400);
  await revokeSessionInCache(sessionId);
  await deleteSession(sessionId);

  return true;
};

//Helper Functions
const createSession = async (userId: string) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await saveSession(sessionId, userId, expiresAt);

  return { sessionId, expiresAt };
};
