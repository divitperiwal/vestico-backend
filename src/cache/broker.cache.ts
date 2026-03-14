import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/helper/expiry.js';

export class BrokerCache {
  static async getCredentials(userId: string) {
    return await redis.get(`broker:credentials:${userId}`);
  }

  static async storeCredentials(userId: string, data: string, expiry: Date) {
    const ttl = calculateTimeToExpiry(expiry);
    await redis.setex(`broker:credentials:${userId}`, ttl, data);
  }

  static async delCredentials(userId: string) {
    await redis.del(`broker:credentials:${userId}`);
  }

  //Funds Cache
  static async getFunds(userId: string) {
    const data = await redis.get(`broker:funds:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  static async storeFunds(userId: string, data: any) {
    await redis.setex(`broker:funds:${userId}`, 240, JSON.stringify(data));
  }

  static async delFunds(userId: string) {
    await redis.del(`broker:funds:${userId}`);
  }

  //Portfolio Cache
  static async getPortfolio(userId: string) {
    const data = await redis.get(`broker:portfolio:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  static async storePortfolio(userId: string, data: any) {
    await redis.setex(`broker:portfolio:${userId}`, 3600, JSON.stringify(data));
  }

  static async delPortfolio(userId: string) {
    await redis.del(`broker:portfolio:${userId}`);
  }
}
