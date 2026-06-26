import { AdminDatabase } from './admin.repository.js';
import { ApiError } from '@/utils/response/error.js';
import { decryptData, encryptData } from '@/utils/security/encryption.js';
import type { BaseBrokerCredentials } from '@/types/common.js';
import { AuthCache } from '@/modules/auth/auth.cache.js';
import { BrokerService } from '../broker/broker.service.js';
import { DhanService } from '@/modules/broker/providers/dhan/dhan.service.js';
import { MstockService } from '@/modules/broker/providers/mstock/mstock.service.js';
import type { Broker, Strategy } from '@/database/schema/enums.schema.js';
import { hashPassword } from '@/utils/security/hashing.js';
import { StrategyClient } from '@/integrations/strategy/strategy.client.js';
import { UserService } from '../users/user.service.js';
import { BrokerCache } from '../broker/broker.cache.js';

export const AdminService = {

  registerUser: async (username: string, email: string, password: string, name: string, broker: Broker, strategy: Strategy) => {
    if (!username || !email || !password || !name)
      throw new ApiError('All fields are required', 400);

    const passwordHash = await hashPassword(password);
    const newUser = await AdminDatabase.createUser(username, email, passwordHash, name, broker, strategy);
    return newUser;
  },

  getAllUsers: async () => {
    const users = await AdminDatabase.getAllUsers();
    return users;
  },

  getUser: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);

    const user = await AdminDatabase.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    return user;
  },

  updateUser: async (userId: string, updateData: object) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    if (Object.keys(updateData).length === 0) throw new ApiError('No data provided for update', 400);

    const user = await AdminService.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    await AdminDatabase.updateUser(userId, updateData)
    return;
  },

  getUserBroker: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await AdminService.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);
    return user.broker;
  },

  isCredentialsPresent: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await AdminService.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    const existingRow = await AdminDatabase.getBrokerCredentials(userId);
    if (!existingRow?.credentials) return false;

    return true;
  },

  updateBrokerCredentials: async (userId: string, credentials: any) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    if (Object.keys(credentials).length === 0)
      throw new ApiError('No credentials provided for update', 400);
    const user = await AdminService.getUser(userId);
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
  },

  revokeUserSession: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await AdminService.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    await AuthCache.revokeSession(userId);
    return;
  },

  deleteAccessToken: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await AdminService.getUser(userId);
    if (!user) throw new ApiError('User not found', 404);

    const existingRow = await AdminDatabase.getBrokerCredentials(userId);
    if (!existingRow?.credentials) throw new ApiError('Broker credentials not found', 404);

    const decrypted = decryptData(existingRow?.credentials);
    const existingCredentials: BaseBrokerCredentials = JSON.parse(decrypted);

    if (!existingCredentials.accessToken) throw new ApiError('Access token not found', 404);
    const newCredentials = { ...existingCredentials, accessToken: null, accessTokenExpiry: null };

    //Encrypt Credentials
    await BrokerService.storeCredentials(userId, newCredentials);
    await BrokerCache.delCredentials(userId);
  },

  getUserPortfolio: async (userId: string) => {
    if (!userId) throw new ApiError("User ID is required", 400);
    const user = await AdminService.getUser(userId);

    switch (user.broker) {
      case "dhan":
        const { accessToken: dhanAccessToken } = await DhanService.getAccessToken(userId)
        return await BrokerService.getPortfolio(userId, user.broker, dhanAccessToken);

      case "mstock":
        const { apiKey, accessToken } = await MstockService.getAccessToken(userId)
        return await BrokerService.getPortfolio(userId, user.broker, accessToken, apiKey);

      default:
        throw new ApiError("Invalid broker", 400);
    }

  },

  getReports: async (day: string) => {
    if (!day) throw new ApiError('Day parameter is required', 400);
    const reports = await StrategyClient.getReports(day);
    return reports;
  },

  getUserRecommendation: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const recommendations = await UserService.getRecommendation(userId);
    return recommendations;
  },

  generateReport: async (day: string, date: string) => {
    if (!day) throw new ApiError('Day parameter is required', 400);
    if (!date) throw new ApiError('Date parameter is required', 400);
    const report = await StrategyClient.generateReport(day, date);
    return report;
  }

}