import {
  generateCsrfToken,
  generateSessionId,
} from "@/utils/tokenGeneration.js";
import { SESSION_DURATION_MS } from "@/constant.js";
import {
  deleteSession,
  getOldSessionByUserId,
  getSession,
  getUserWithPassword,
  registerUserData,
  saveSession,
} from "@/database/auth.database.js";
import { ApiError } from "@/utils/ApiError.js";
import { comparePassword, hashPassword } from "@/utils/hashing.js";
import { createCsrfCookie, createSessionCookie } from "@/utils/cookies.js";

export const validateSession = async (sessionId: string) => {
  const session = await getSession(sessionId);

  if (session && session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  return {
    userId: session?.userId,
    email: session?.email,
    sessionId: session?.sessionId,
    role: session?.role,
  };
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password)
    throw new ApiError("Email and Password are required", 400);
  const user = await getUserWithPassword(email);
  if (!user) throw new ApiError("Invalid Credentials", 401);

  //Check user's password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new ApiError("Invalid Credentials", 401);

  //Delete any old session of user if exists

  const oldSession = await getOldSessionByUserId(user.userId);
  if (oldSession) await deleteSession(oldSession.sessionId);

  //Create new session for the user

  const { sessionId } = await createSession(user.userId);
  const csrfToken = generateCsrfToken();

  const sessionCookie = createSessionCookie(sessionId);
  const csrfCookie = createCsrfCookie(csrfToken);

  const userData = {
    userId: user.userId,
    email: user.email,
    name: user.name,
  };

  return { sessionCookie, csrfCookie, user: userData };
};

export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  if (!email || !password || !name)
    throw new ApiError("Email, Password and Name are required", 400);

  //Check if user already exists
  const existingUser = await getUserWithPassword(email);
  if (existingUser) throw new ApiError("User already exists", 409);

  const passwordHash = await hashPassword(password);
  const user = await registerUserData(email, passwordHash, name);

  //Create new session for the user
  const { sessionId } = await createSession(user.userId);
  const csrfToken = generateCsrfToken();
  const csrfCookie = createCsrfCookie(csrfToken);
  const sessionCookie = createSessionCookie(sessionId);

  return { sessionCookie, csrfCookie, user };
};

export const logoutUser = async (sessionId: string) => {
  if (!sessionId) throw new ApiError("Session ID is required", 400);
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
