import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/expiry.js';

export const storeMstockCredentials = async (userId: string, credentials: any, expiry: Date) => {
  const key = `mstock:credentials:${userId}`;
  const expire = calculateTimeToExpiry(expiry);
  await redis.set(key, JSON.stringify(credentials));
  await redis.expire(key, expire);
};

export const getMstockCredentials = async (userId: string) => {
  const key = `mstock:credentials:${userId}`;
  const data = await redis.get(key);
  if (!data) return null;

  return JSON.parse(data);
};

export const deleteMstockCredentials = async (userId: string) => {
  const key = `mstock:credentials:${userId}`;
  await redis.del(key);
};

//Mstock Portfolio Data
export const storeMstockPortfolioToCache = async (userId: string, portfolioData: object) => {
  const key = `mstock:portfolio:${userId}`;
  await redis.set(key, JSON.stringify(portfolioData));
  await redis.expire(key, 60);
};

export const getMstockPortfolioFromCache = async (userId: string) => {
  const key = `mstock:portfolio:${userId}`;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const deleteMstockPortfolioFromCache = async (userId: string) => {
  const key = `mstock:portfolio:${userId}`;
  await redis.del(key);
};

//Mstock Funds Data
export const storeMstockFundsToCache = async (userId: string, fundsData: object) => {
  const key = `mstock:funds:${userId}`;
  await redis.set(key, JSON.stringify(fundsData));
  await redis.expire(key, 60);
};

export const getMstockFundsFromCache = async (userId: string) => {
  const key = `mstock:funds:${userId}`;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const deleteMstockFundsFromCache = async (userId: string) => {
  const key = `mstock:funds:${userId}`;
  await redis.del(key);
};
