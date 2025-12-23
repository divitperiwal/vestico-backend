import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/helper/expiry.js';

export class AuthCache {
  //Session Operations
  static async getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    const sessionData = await redis.hgetall(key);
    if (Object.keys(sessionData).length === 0) return null;
    return sessionData;
  }

  static async storeSession(sessionId: string, userId: string, role: string, expiresAt: Date) {
    const key = `session:${sessionId}`;
    await redis.hset(key, { userId, role });
    const expire = calculateTimeToExpiry(expiresAt);
    await redis.expire(key, expire);
  }

  static async revokeSession(sessionId: string) {
    const key = `session:${sessionId}`;
    await redis.del(key);
  }
}
