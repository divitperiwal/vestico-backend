import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/parsers/expiry.js';

export const AuthCache = {
  getSession: (sessionId: string) => {
    const key = `session:${sessionId}`;
    return redis.get(key);
  },

  storeSession: (sessionId: string, userId: string, expiresAt: Date) => {
    const key = `session:${sessionId}`;
    return redis.setex(key, calculateTimeToExpiry(expiresAt), userId);
  },

  revokeSession: (sessionId: string) => {
    const key = `session:${sessionId}`;
    return redis.del(key);
  }
}