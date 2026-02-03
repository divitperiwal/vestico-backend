import { AuthCache } from '@/cache/auth.cache.js';
import { UserCache } from '@/cache/user.cache.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { AuthDatabase } from './auth.database.js';
import { comparePassword, hashPassword } from '@/utils/helper/hashing.js';
import { generateCsrfToken, generateSessionId } from '@/utils/constants/tokenGeneration.js';
import { SESSION_DURATION_MS } from '@/constant.js';
import { createCsrfCookie, createSessionCookie } from '@/utils/helper/cookies.js';
import { UserDatabase } from '../users/user.database.js';

export class AuthService {
  //Session Operations
  static async validateSession(sessionId: string) {
    //Check if session exists in redis
    const session = await AuthCache.getSession(sessionId);
    if (!session) throw new ApiError('Invalid Session', 401);

    //Get User from Cache
    let user = await UserCache.getUser(session.userId);
    if (user) return { ...user, sessionId };

    user = await UserDatabase.getUser(session.userId);
    if (!user) throw new ApiError('User not found', 404);

    await UserCache.storeUser(user.userId, user);
    return { ...user, sessionId };
  }

  //Login User
  static async loginUser(username: string, password: string) {
    if (!username || !password) throw new ApiError('Username and Password are required', 400);
    const user = await AuthDatabase.getUserWithPassword(username);
    if (!user) throw new ApiError('Invalid Credentials', 401);

    //Check user's password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new ApiError('Invalid Credentials', 401);

    //Delete any old session of user if exists
    const oldSession = await AuthDatabase.getOldSessionByUserId(user.userId);
    if (oldSession) {
      await Promise.allSettled([
        AuthCache.revokeSession(oldSession.sessionId),
        AuthDatabase.deleteSession(oldSession.sessionId),
      ]);
    }

    //Create new session for the user and store in Redis & DB
    const { sessionId, expiresAt } = await this.createSession(user.userId, user.role);
    const csrfToken = generateCsrfToken();

    //Cookies
    const csrfCookie = createCsrfCookie(csrfToken);
    const sessionCookie = createSessionCookie(sessionId);

    return { sessionCookie, csrfCookie, user };
  }

  //Register User
  static async registerUser(username: string, email: string, password: string, name: string) {
    if (!username || !email || !password || !name)
      throw new ApiError('Username, Email, Password and Name are required', 400);
    const exisitingUser = await AuthDatabase.getUserWithPassword(username);
    if (exisitingUser) throw new ApiError('User with this username already exists', 409);
    const passwordHash = await hashPassword(password);
    const user = await AuthDatabase.createUser(username, email, passwordHash, name);
    if (!user) throw new ApiError('Failed to create user', 500);

    //Create new session for the user
    const { sessionId, expiresAt } = await this.createSession(user.userId, user.role);
    const csrfToken = generateCsrfToken();

    //Cookies
    const csrfCookie = createCsrfCookie(csrfToken);
    const sessionCookie = createSessionCookie(sessionId);

    return { sessionCookie, csrfCookie, user };
  }

  //Logout User
  static async logoutUser(sessionId: string) {
    if (!sessionId) throw new ApiError('Session ID is required', 400);
    await AuthCache.revokeSession(sessionId);
    await AuthDatabase.deleteSession(sessionId);
    return
  }

  //Helper Functions
  private static async createSession(userId: string, role: string) {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await Promise.allSettled([
      AuthCache.storeSession(sessionId, userId, role, expiresAt),
      AuthDatabase.saveSession(sessionId, userId, expiresAt),
    ]);

    return { sessionId, expiresAt };
  }
}
