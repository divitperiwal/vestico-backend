import redis from '@/config/redis.config.js';

export class UserCache {
  static async getUser(userId: string) {
    const key = `profile:${userId}`;
    const userData = await redis.get(key);
    if (!userData) return null;
    return JSON.parse(userData);
  }
  static async storeUser(userId: string, profileData: object) {
    const key = `profile:${userId}`;
    await redis.set(key, JSON.stringify(profileData));
    await redis.expire(key, 12 * 60 * 60);
  }
  static async deleteUser(userId: string) {
    const key = `profile:${userId}`;
    await redis.del(key);
  }
}
