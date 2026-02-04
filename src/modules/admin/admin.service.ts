import { AdminDatabase } from './admin.database.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { AdminCache } from '@/cache/admin.cache.js';
import { decryptData, encryptData } from '@/utils/helper/encryption.js';
import type { BaseBrokerCredentials } from '@/types/common.js';
import { AuthCache } from '@/cache/auth.cache.js';
import { BrokerService } from '../broker/broker.service.js';
import { DhanService } from '../broker/dhan/dhan.service.js';
import { MstockService } from '../broker/mstock/mstock.service.js';
import type { Broker, Strategy } from '@/database/schema/enums.schema.js';
import { hashPassword } from '@/utils/helper/hashing.js';

export class AdminService {

  static async registerUser(username: string, email: string, password: string, name: string, broker: Broker, strategy: Strategy) {
    if (!username || !email || !password || !name)
      throw new ApiError('All fields are required', 400);
    
    const passwordHash = await hashPassword(password);
    const newUser = await AdminDatabase.createUser(username, email, passwordHash, name, broker, strategy);
    return newUser;
  }

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

  static async isCredentialsPresent(userId:string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    const existingRow = await AdminDatabase.getBrokerCredentials(userId);
    if (!existingRow?.credentials) return false;

    return true;
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
      accessToken: null,
      accessTokenExpiry: null,
    };

    //Encrypt Credentials
    const encryptedCredentials = encryptData(JSON.stringify(mergedCredentials));
    await AdminDatabase.updateBrokerCredentials(userId, encryptedCredentials);

    return;
  }

  static async revokeUserSession(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    await AdminDatabase.revokeUserSession(userId);
    await AuthCache.revokeSession(userId);
    return;
  }

  static async deleteAccessToken(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await this.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    const existingRow = await AdminDatabase.getBrokerCredentials(userId);
    if (!existingRow?.credentials) throw new ApiError('Broker credentials not found', 404);

    const decrypted = decryptData(existingRow?.credentials);
    const existingCredentials: BaseBrokerCredentials = JSON.parse(decrypted);

    if (!existingCredentials.accessToken) throw new ApiError('Access token not found', 404);
    const newCredentials = { ...existingCredentials, accessToken: null, accessTokenExpiry: null };

    //Encrypt Credentials
    await BrokerService.encryptAndStoreCredentials(userId, newCredentials);
  }

  static async getUserPortfolio(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);

    const result = await BrokerService.resolveBrokerContext(userId);

    switch (result?.broker) {
      case 'dhan':
        return DhanService.getPortfolio(userId, result.accessToken);
      case 'mstock':
        return MstockService.getPortfolio(result.apiKey, result.accessToken, userId);
      default:
        throw new ApiError('Unsupported broker', 400);
    }
  }

}
