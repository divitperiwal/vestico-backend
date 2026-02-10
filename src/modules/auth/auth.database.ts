import { db } from '@/config/drizzle.config.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { broker_credentials, sessions, users } from '@/database/schema/index.js';
import { eq } from 'drizzle-orm';

export class AuthDatabase {
  //Session Operations
  static async saveSession(sessionId: string, userId: string, expiresAt: Date) {
    const [session] = await db
      .insert(sessions)
      .values({
        sessionId,
        userId,
        expiresAt,
      })
      .returning({
        sessionId: sessions.sessionId,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      });
    if (!session) throw new ApiError('Failed to save session', 500);
    return session;
  }

  //Get Session
  static async getSession(sessionId: string) {
    const result = await db
      .select({
        sessionId: sessions.sessionId,
        expiresAt: sessions.expiresAt,
        userId: sessions.userId,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.userId))
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  static async deleteSession(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
    return true;
  }

  static async getOldSessionByUserId(userId: string) {
    const [session] = await db
      .select({
        sessionId: sessions.sessionId,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .limit(1);
    return session ?? null;
  }

  //User Authentication Operations
  static async getUserWithPassword(username: string) {
    const [user] = await db
      .select({
        userId: users.userId,
        username: users.username,
        password: users.password,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user ?? null;
  }

  static async getUserWithPasswordByUserId(userId: string) {
    const [user] = await db
      .select({
        userId: users.userId,
        username: users.username,
        password: users.password,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    return user ?? null;
  }

  static async createUser(username: string, email: string, passwordHash: string, name: string) {
    return db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ username, email, password: passwordHash, name, role: 'user' })
        .returning({
          userId: users.userId,
          username: users.username,
          name: users.name,
          role: users.role,
        });
      if (!user) throw new ApiError('Failed to register user', 500);
      await tx
        .insert(broker_credentials)
        .values({ userId: user.userId, broker: 'mstock', credentials: null })
        .onConflictDoNothing();

      return user;
    });
  }
}
