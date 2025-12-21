import { getUser, updateUserPassword } from '@/database/user.database.js';
import { ApiError } from '@/utils/ApiError.js';
import { comparePassword, hashPassword } from '@/utils/hashing.js';
import { getProfileFromCache, saveProfileToCache } from './redis/profile.service.js';
import { getUserWithPassword } from '@/database/auth.database.js';

export const getUserProfile = async (userId: string) => {
  if (!userId) throw new ApiError('Unauthorized', 401);
  const cached = await getProfileFromCache(userId);
  if (cached) return cached;
  const user = await getUser(userId);
  if (!user) throw new ApiError('User not found', 404);
  await saveProfileToCache(userId, user!);
  return user;
};

export const changeUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  if (!userId) throw new ApiError('Unauthorized', 401);
  if (!oldPassword || !newPassword)
    throw new ApiError('Old password and new password are required', 400);

  const user = await getUserWithPassword(userId);
  if (!user) throw new ApiError('User not found', 404);

  const isOldPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isOldPasswordValid) throw new ApiError('Old password is incorrect', 400);

  //Hashing the new password and updating it in the database
  const newPasswordHash = await hashPassword(newPassword);
  await updateUserPassword(userId, newPasswordHash);

  return;
};
