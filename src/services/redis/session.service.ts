import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/expiry.js';

export const storeSessionInCache = async (
  sessionId: string,
  userId: string,
  role: string,
  expiresAt: Date,
) => {
  const key = `session:${sessionId}`;
  await redis.hset(key, { userId, role });
  const expire = calculateTimeToExpiry(expiresAt);
  await redis.expire(key, expire);
};

export const getSessionFromCache = async (sessionId: string) => {
  const key = `session:${sessionId}`;
  const sessionData = await redis.hgetall(key);
  if (Object.keys(sessionData).length === 0) return null;
  return sessionData;
};

export const revokeSessionInCache = async (sessionId: string) => {
  const key = `session:${sessionId}`;
  await redis.del(key);
};
