import redis from '@/config/redis.config.js';

export const AuthCache = {
  getSession: (sessionId: string) => {
    const key = `session:${sessionId}`;
    return redis.get(key);
  },

  storeSession: (sessionId: string, userId: string, ttl: number) => {
    const key = `session:${sessionId}`;
    return redis.setex(key, ttl, userId);
  },

  revokeSession: (sessionId: string) => {
    const key = `session:${sessionId}`;
    return redis.del(key);
  }
}