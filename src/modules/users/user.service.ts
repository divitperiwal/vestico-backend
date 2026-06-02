import { UserCache } from '@/modules/users/user.cache.js';
import { UserRepository } from './user.repository.js';
import { ApiError } from '@/utils/response/error.js';
import { comparePassword, hashPassword } from '@/utils/security/hashing.js';
import { StrategyClient } from '@/integrations/strategy/strategy.client.js';
import { filterPortfolio } from '@/utils/parsers/filter.js';
import { BrokerService } from '../broker/broker.service.js';


export const UserService = {
  getUser: async (userId: string) => {
    if (!userId) throw new ApiError('Unauthorized', 401);

    const cached = await UserCache.get(userId);
    if (cached) return cached;

    const user = await UserRepository.getUser(userId)
    if (!user) throw new ApiError('User not found', 404);

    UserCache.set(userId, user);
    return user;
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    if (!userId) throw new ApiError('Unauthorized', 401);
    if (!oldPassword || !newPassword) throw new ApiError('Old password and new password are required', 400);

    const user = await UserRepository.getUserWithPassword(userId);
    if (!user) throw new ApiError('User not found', 404);

    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) throw new ApiError('Old password is incorrect', 400);

    const newPasswordHash = await hashPassword(newPassword);
    await UserRepository.updatePassword(userId, newPasswordHash);

    return true;
  },

  getRecommendation: async (userId: string) => {
    if (!userId) throw new ApiError('Unauthorized', 401);

    const [user, credentials] = await Promise.all([
      UserService.getUser(userId),
      BrokerService.getCredentials(userId)
    ]);

    if (!user.strategy) throw new ApiError('User strategy not found', 404);

    const portfolio = await BrokerService.getPortfolio(userId, user.broker, credentials.accessToken, credentials.apiKey);
    const filtered = await filterPortfolio(portfolio);

    if (!filtered) throw new ApiError('Error in filtering portfolio', 500);

    return await StrategyClient.getRecommendations(user.strategy, filtered);
  }
}
