import { AuthCache } from '@/modules/auth/auth.cache.js';
import { UserCache } from '@/modules/users/user.cache.js';
import { ApiError } from '@/utils/response/error.js';
import { AuthRepository } from './auth.repository.js';
import { comparePassword } from '@/utils/security/hashing.js';
import { generateCsrfToken } from '@/utils/response/token.js';
import { createCsrfCookie, createSessionCookie } from '@/utils/response/cookies.js';
import { createSession } from '@/utils/security/session.js';
import { UserRepository } from '@/modules/users/user.repository.js';

export const AuthService = {
  validateSession: async (sessionId: string) => {
    const session = await AuthCache.getSession(sessionId);
    if (!session) throw new ApiError('Invalid Session', 401);

    const cached = await UserCache.get(session);
    if (cached) return { ...cached, sessionId };

    const user = await UserRepository.getUser(session);
    if (!user) throw new ApiError('User not found', 404);

    UserCache.set(user.userId, user);
    return { ...user, sessionId };
  },

  login: async (username: string, password: string) => {
    if (!username || !password) throw new ApiError('Username and Password are required', 400);
    const user = await AuthRepository.findUserWithPassword(username);
    if (!user) throw new ApiError('Invalid Credentials', 401);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new ApiError('Invalid Credentials', 401);

    //Don't allow more than 2 session for the same user

    const { sessionId, expiresAt } = await createSession(user.userId);
    const csrfToken = generateCsrfToken();

    //Cookies
    const sessionCookie = createSessionCookie(sessionId);
    const csrfCookie = createCsrfCookie(csrfToken);
    const userWithoutPassword = {
      userId: user.userId,
      username: user.username,
      name: user.name,
      role: user.role,
    }
    return { sessionCookie, csrfCookie, user: userWithoutPassword };
  },

  logout: async (sessionId: string) => {
    if (!sessionId) throw new ApiError('Session ID is required', 400);
    await AuthCache.revokeSession(sessionId);
    return;
  }
}

