import redis from '@/config/redis.config.js';


export const UserCache = {
  get: async (userId: string) => {
    const user = await redis.get(`user:${userId}`);
    return user ? JSON.parse(user) : null;
  },

  set: async (userId: string, userData: object) => {
    await redis.setex(`user:${userId}`, 6 * 60 * 60, JSON.stringify(userData));
  },

  delete: async (userId: string) => {
    await redis.del(`user:${userId}`);
  }
}

