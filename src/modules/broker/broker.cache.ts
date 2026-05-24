import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/parsers/expiry.js';

export const BrokerCache = {
  getCredentials: async (userId: string) => {
    return await redis.get(`broker:credentials:${userId}`);
  },
  storeCredentials: async (userId: string, data: string, expiry: string) => {
    const ttl = calculateTimeToExpiry(new Date(expiry));
    if (!ttl || ttl <= 0) return;
    await redis.setex(`broker:credentials:${userId}`, ttl, data);
  },
  delCredentials: async (userId: string) => {
    await redis.del(`broker:credentials:${userId}`);
  },

  //Funds Cache
  getFunds: async (userId: string) => {
    const data = await redis.get(`broker:funds:${userId}`);
    return data ? JSON.parse(data) : null;
  },

  storeFunds: async (userId: string, data: any) => {
    await redis.setex(`broker:funds:${userId}`, 3600, JSON.stringify(data));
  },

  delFunds: async (userId: string) => {
    await redis.del(`broker:funds:${userId}`);
  },

  //Portfolio Cache
  getPortfolio: async (userId: string) => {
    const data = await redis.get(`broker:portfolio:${userId}`);
    return data ? JSON.parse(data) : null;
  },

  storePortfolio: async (userId: string, data: any) => {
    await redis.setex(`broker:portfolio:${userId}`, 3600, JSON.stringify(data));
  },

  delPortfolio: async (userId: string) => {
    await redis.del(`broker:portfolio:${userId}`);
  },

  //Positions Cache
  getPositions: async (userId: string) => {
    const data = await redis.get(`broker:positions:${userId}`);
    return data ? JSON.parse(data) : null;
  },

  storePositions: async (userId: string, data: any) => {
    await redis.setex(`broker:positions:${userId}`, 240, JSON.stringify(data));
  },

  delPositions: async (userId: string) => {
    await redis.del(`broker:positions:${userId}`);
  },

}

