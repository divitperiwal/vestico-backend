import { UserCache } from '@/cache/user.cache.js';
import { UserDatabase } from './user.database.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { AuthDatabase } from '../auth/auth.database.js';
import { comparePassword, hashPassword } from '@/utils/helper/hashing.js';
import { BrokerService } from '../broker/broker.service.js';
import { RankGenerator } from '@/lib/generate-rank.js';

export class UserService {
  static async getUserProfile(userId: string) {
    if (!userId) throw new Error('Unauthorized');

    //Fetch from Cache
    const cached = await UserCache.getUser(userId);
    if (cached) return cached;

    //Fetch from DB
    const user = await UserDatabase.getUser(userId);
    if (!user) throw new Error('User not found');

    //Store in cache
    await UserCache.storeUser(userId, user);
    return user;
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    if (!userId) throw new ApiError('Unauthorized', 401);
    if (!oldPassword || !newPassword)
      throw new ApiError('Old password and new password are required', 400);

    const user = await AuthDatabase.getUserWithPassword(userId);
    if (!user) throw new ApiError('User not found', 404);

    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) throw new ApiError('Old password is incorrect', 400);

    //Hashing the new password and updating it in the database
    const newPasswordHash = await hashPassword(newPassword);
    await UserDatabase.updateUserPassword(userId, newPasswordHash);

    return;
  }

  static async getUserRecommendation(userId: string) {
    if (!userId) throw new ApiError('Unauthorized', 401);
    const user = await this.getUserProfile(userId);
    const strategyId = user.strategy;
    if (!strategyId) throw new ApiError('User strategy not found', 404);
    //Fetch recommendations
    const filteredPortfolio = await BrokerService.getFilteredPortfolio(userId);
    const recommendations = await RankGenerator.getRecommendations(strategyId, filteredPortfolio);

    return recommendations;
  }
}
