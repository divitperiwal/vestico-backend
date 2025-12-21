import redis from '@/config/redis.config.js';
import { calculateTimeToExpiry } from '@/utils/expiry.js';

export const saveProfileToCache = async (userId: string, profileData: object) => {
  const key = `profile:${userId}`;
  await redis.set(key, JSON.stringify(profileData));
  await redis.expire(key, 12 * 60 * 60);
};

export const getProfileFromCache = async (userId: string) => {
  const key = `profile:${userId}`;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const deleteProfileFromCache = async (userId: string) => {
  const key = `profile:${userId}`;
  await redis.del(key);
};

//Admin Routes
export const saveUserProfileToCacheAdmin = async (userId: string, profileData: object) => {
  const key = `admin:profile:${userId}`;
  await redis.set(key, JSON.stringify(profileData));
  await redis.expire(key, 12 * 60 * 60);
};

export const getUserProfileFromCacheAdmin = async (userId: string) => {
  const key = `admin:profile:${userId}`;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const deleteUserProfileFromCacheAdmin = async (userId: string) => {
  const key = `admin:profile:${userId}`;
  await redis.del(key);
};


//All Users
export const saveAllUsersToCacheAdmin = async (usersData: object[]) => {
  const key = `admin:users`;
  await redis.set(key, JSON.stringify(usersData));
  await redis.expire(key, 12 * 60 * 60);
};

export const getAllUsersFromCacheAdmin = async () => {
  const key = `admin:users`;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const deleteAllUsersFromCacheAdmin = async () => {
  const key = `admin:users`;
  await redis.del(key);
};
