import redis from '@/config/redis.config.js';

export class AdminCache {
  static async getAllUsers() {
    const key = `admin:all_users`;
    const usersData = await redis.get(key);
    if (!usersData) return null;
    return JSON.parse(usersData);
  }

  static async storeAllUsers(usersData: object) {
    const key = `admin:all_users`;
    await redis.set(key, JSON.stringify(usersData));
    await redis.expire(key, 6 * 60 * 60);
  }

  static async deleteAllUsers() {
    const key = `admin:all_users`;
    await redis.del(key);
  }

  //Each user admin cache
  static async getUser(userId: string) {
    const key = `admin:profile:${userId}`;
    const userData = await redis.get(key);
    if (!userData) return null;
    return JSON.parse(userData);
  }

  static async storeUser(userId: string, profileData: object) {
    const key = `admin:profile:${userId}`;
    await redis.set(key, JSON.stringify(profileData));
    await redis.expire(key, 6 * 60 * 60);
  }

  static async deleteUser(userId: string) {
    const key = `admin:profile:${userId}`;
    await redis.del(key);
  }
}
