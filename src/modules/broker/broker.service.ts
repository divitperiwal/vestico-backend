import { BrokerCache } from '@/cache/broker.cache.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { BrokerDatabase } from './broker.database.js';
import { decryptData, encryptData } from '@/utils/helper/encryption.js';
import { UserService } from '../users/user.service.js';
import { MstockService } from './mstock/mstock.service.js';
import { DhanService } from './dhan/dhan.service.js';
import { StrategyClient } from '@/lib/strategy-client.js';
import { MarketCache } from '@/cache/market.cache.js';

export class BrokerService {
  static async getCredentials(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const cached = await BrokerCache.getCredentials(userId);
    if (cached) return JSON.parse(decryptData(cached));

    //If not in cache credentials found, fetch from database
    const response = await BrokerDatabase.getCredentials(userId);
    if (!response || !response.credentials) throw new ApiError('Broker credentials not found', 404);

    console.log(response.credentials)
    const decrypted = JSON.parse(decryptData(response.credentials));

    //Store in cache for future requests
    await this.encryptAndStoreCredentials(userId, decrypted);
    return decrypted;
  }

  static async resolveBrokerContext(userId: string) {
    if (!userId) throw new ApiError('User ID is required', 400);
    const user = await UserService.getUserProfile(userId);
    if (!user) throw new ApiError('User not found', 404);

    const broker = user.broker;
    const credentials = await this.getCredentials(userId);
    if (!credentials) throw new ApiError('Broker credentials not found', 404);

    switch (broker) {
      case 'dhan':
        const result = await DhanService.getDhanAccessToken(userId);
        return { broker, accessToken: result.accessToken };
      case 'mstock':
        const { accessToken, apiKey } = await MstockService.getAccessToken(userId);
        return { broker, accessToken, apiKey };
    }
  }

  static async encryptAndStoreCredentials(userId: string, credentials: any) {
    const encrypted = encryptData(JSON.stringify(credentials));
    await BrokerCache.storeCredentials(userId, encrypted, credentials.accessTokenExpiry);
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

  static async getFilteredPortfolio(userId: string) {
    const brokerContext = await this.resolveBrokerContext(userId);
    const broker = brokerContext!.broker;
    let portfolio: any[] = [];
    switch (broker) {
      case 'dhan':
        portfolio = await DhanService.getPortfolio(userId, brokerContext!.accessToken);
        break;
      case 'mstock':
        portfolio = await MstockService.getPortfolio(
          brokerContext!.apiKey,
          brokerContext!.accessToken,
          userId,
        );
        break;
    }
    if (portfolio.length === 0) throw new ApiError('Portfolio is empty', 400);
    const ETF_LIST = (await this.getETFList()).map((etf: any) => `${etf.ticker}`);
    const name = broker === 'dhan' ? 'tradingSymbol' : 'tradingsymbol';
    const filterport = portfolio
      .filter((item) => ETF_LIST.some((etf: any) => etf == item[name]))
      .map((item) => item[name]);
    return filterport;
  }

  private static async getETFList() {
    const ETF_LIST = await StrategyClient.getETFList();
    if (!ETF_LIST || ETF_LIST.length === 0) throw new ApiError('Failed to fetch ETF list', 500);
    return ETF_LIST.data;
  }
}
