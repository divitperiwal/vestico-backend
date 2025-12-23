import { AdminDatabase } from './admin.database.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { AdminCache } from '@/cache/admin.cache.js';
import { decryptData, encryptData } from '@/utils/helper/encryption.js';
import type { BaseBrokerCredentials } from '@/types/common.js';

export class AdminService {
  static async getAllUsers() {
    const cached = await AdminCache.getAllUsers();
    if (cached) return cached;

    const users = await AdminDatabase.getAllUsers();
    await AdminCache.storeAllUsers(users);
    return users;
  }

  static async getUser(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const cache = await AdminCache.getUser(userId);
    if (cache) return cache;

    const user = await AdminDatabase.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);
    //Save user to cache
    await AdminCache.storeUser(userId, user);
    return user;
  }

  static async updateUser(userId: string, updateData: object) {
    if (!userId) throw new ApiError('User ID is required', 400);
    if (Object.keys(updateData).length === 0)
      throw new ApiError('No data provided for update', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    await Promise.allSettled([
      AdminDatabase.updateUser(userId, updateData),
      AdminCache.deleteUser(userId),
      AdminCache.deleteAllUsers(),
    ]);
    return;
  }
  static async getUserBroker(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);
    return user.broker;
  }

  static async updateBrokerCredentials(userId: string, credentials: any) {
    if (!userId) throw new ApiError('User ID is required', 400);
    if (Object.keys(credentials).length === 0)
      throw new ApiError('No credentials provided for update', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    const existingRow = await AdminDatabase.getBrokerCredentials(userId);
    let existingCredentials: BaseBrokerCredentials = {};
    if (existingRow?.credentials) {
      const decrypted = decryptData(existingRow?.credentials);
      existingCredentials = JSON.parse(decrypted);
    }
    const mergedCredentials = {
      ...existingCredentials,
      ...credentials,
      accessToken:  null,
      accessTokenExpiry:null,
    };

    //Encrypt Credentials
    const encryptedCredentials = encryptData(JSON.stringify(mergedCredentials));
    await AdminDatabase.updateBrokerCredentials(userId, encryptedCredentials);

    return;
  }



}
