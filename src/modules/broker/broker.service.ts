import { BrokerCache } from '@/cache/broker.cache.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { BrokerDatabase } from './broker.database.js';
import { decryptData, encryptData } from '@/utils/helper/encryption.js';

export class BrokerService {
  static async getCredentials(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const cached = await BrokerCache.getCredentials(userId);
    if (cached) return JSON.parse(decryptData(cached));

    //If not in cache credentials found, fetch from database
    const response = await BrokerDatabase.getCredentials(userId);
    if (!response || !response.credentials) throw new ApiError('Broker credentials not found', 404);

    const decrypted = JSON.parse(decryptData(response.credentials));

    //Store in cache for future requests
    await this.encryptAndStoreCredentials(userId, decrypted);
    return decrypted;
  }

  static async encryptAndStoreCredentials(userId: string, credentials: any) {
    const encrypted = encryptData(JSON.stringify(credentials));
    Promise.allSettled([
      BrokerDatabase.storeCredentials(userId, encrypted),
      BrokerCache.storeCredentials(userId, encrypted, credentials.accessTokenExpiry),
    ]);
  }

  static async getETFs(portfolio: Array<any>) {
    if (!portfolio) throw new ApiError('Portfolio data is required', 400);
    const etf = portfolio.filter((item) => item.isin.startsWith('INF'));
    return etf;
  }

  static async getStocks(portfolio: Array<any>) {
    if (!portfolio) throw new ApiError('Portfolio data is required', 400);
    const stocks = portfolio.filter((item) => !item.isin.startsWith('INE'));
    return stocks;
  }
}
