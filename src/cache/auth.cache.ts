import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/helper/expiry.js';

export class AuthCache {
  //Session Operations
  static async getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    const sessionData = await redis.get(key);
    return sessionData ?? null;
  }

  static async storeSession(sessionId: string, userId: string, expiresAt: Date) {
    const key = `session:${sessionId}`;
    await redis.setex(key, calculateTimeToExpiry(expiresAt), userId,);
  }

  static async revokeSession(sessionId: string) {
    const key = `session:${sessionId}`;
    await redis.del(key);
  }
}
