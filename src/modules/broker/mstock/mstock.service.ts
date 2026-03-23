import { BrokerCache } from '@/cache/broker.cache.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { MstockClient } from '@/lib/mstock-client.js';
import { getMiraeTokenExpiry } from '@/utils/helper/expiry.js';
import { BrokerService } from '../broker.service.js';
import { generateTOTP } from '@/utils/helper/totp.js';
import { AdminService } from '@/modules/admin/admin.service.js';
import { connectMstock } from './mstock.ws.js';
import { parseInstruments } from '@/utils/constants/csv-parse.js';
import { MarketCache } from '@/cache/market.cache.js';

export class MstockService {
  static async getAccessToken(userId: string, forceRefresh = false) {
    const credentials = await BrokerService.getCredentials(userId);
    if (
      !forceRefresh &&
      credentials.accessToken &&
      credentials.accessTokenExpiry &&
      new Date() < new Date(credentials.accessTokenExpiry)
    ) {
      return { accessToken: credentials.accessToken, apiKey: credentials.apiKey };
    }

    // Generate new access token
    return await this.generateAccessToken(userId, credentials);
  }

  static async logout(userId: string, apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    await MstockClient.logout(apiKey, token);
    await AdminService.deleteAccessToken(userId);
    return;
  }

  //Routes Functions
  static async getFunds(apiKey: string, token: string, userId: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    const cached = await BrokerCache.getFunds(userId);
    if (cached) return cached;

    try {
      const funds = await MstockClient.getFunds(apiKey, token);
      await BrokerCache.storeFunds(userId, funds);
      return funds;
    } catch {
      const { accessToken, apiKey: newKey } = await this.getAccessToken(userId, true);
      const funds = await MstockClient.getFunds(newKey, accessToken);
      await BrokerCache.storeFunds(userId, funds);
      return funds;
    }
  }

  static async getPortfolio(apiKey: string, token: string, userId: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);
    const cached = await BrokerCache.getPortfolio(userId);
    if (cached) return cached;

    try {
      const portfolio = await MstockClient.getPortfolio(apiKey, token);
      await BrokerCache.storePortfolio(userId, portfolio);
      return portfolio;
    } catch {
      const { accessToken, apiKey: newKey } = await this.getAccessToken(userId, true);
      const portfolio = await MstockClient.getPortfolio(newKey, accessToken);
      await BrokerCache.storePortfolio(userId, portfolio);
      return portfolio;
    }
  }

  static async getPositions(apiKey: string, token: string, userId: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    try {
      const positions = await MstockClient.getPositions(apiKey, token);
      return positions;
    } catch (error) {
      const { accessToken, apiKey: newKey } = await this.getAccessToken(userId, true);
      const positions = await MstockClient.getPositions(newKey, accessToken);
      return positions;
    }
  }

  //Data Functions
  static async getOlhcData(apiKey: string, token: string, ticker: string[]) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);
    if (ticker.length === 0) throw new ApiError('Ticker is required', 400);
    const data = await MstockClient.getOlhcData(apiKey, token, ticker);
    return data;
  }

  static async getIntradayData(apiKey: string, token: string, instrument_token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    const data = await MstockClient.getIntradayData(apiKey, token, '1', instrument_token, 'minute');
    return data;
  }

  static async getTopMovers(apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    const cached = await MarketCache.get("movers");
    if (cached) return JSON.parse(cached);


    const [gainers, losers] = await Promise.all([
      MstockClient.getTopMovers(apiKey, token, 'g'),
      MstockClient.getTopMovers(apiKey, token, 'l')
    ]);

    const movers = { gainers, losers };

    MarketCache.set("movers", JSON.stringify(movers), 900);
    return { gainers, losers };
  }

  static async getInstruments(apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);
    const res = await MstockClient.getInstruments(apiKey, token);
    const data = parseInstruments(res);
    if (!data) throw new ApiError('Failed to parse instruments data', 500);
    return data;
  }

  static async getLTP(apiKey: string, token: string, ticker: string[]) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);
    if (ticker.length === 0) throw new ApiError('Ticker is required', 400);
  }


  //Orders
  static async getOrderBook(apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    const data = await MstockClient.getOrderBook(apiKey, token);
    return data;
  }

  static async getTradeBook(apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);

    const data = await MstockClient.getTradeBook(apiKey, token);
    return data;
  }









  //Websocket
  static async getWsConnection(apiKey: string, token: string) {
    if (!token) throw new ApiError('Access Token not found', 401);
    if (!apiKey) throw new ApiError('API Key not found', 404);
    connectMstock(apiKey, token);
    return;
  }


  //Private Methods
  private static async generateAccessToken(userId: string, credentials: any) {
    if (!credentials.apiKey) throw new ApiError('API Key not found', 404);
    if (!credentials.totpKey) throw new ApiError('TOTP Secret not found', 404);

    //Generate Access Token
    const totp = await this.getTotp(credentials.totpKey);
    const token = await MstockClient.getAccessToken(credentials.apiKey, totp);

    //Caclulate Expiry
    const expiry = getMiraeTokenExpiry();
    credentials.accessToken = token;
    credentials.accessTokenExpiry = expiry;

    //Encrypt and store in DB & Redis
    await BrokerService.encryptAndStoreCredentials(userId, credentials);

    return { accessToken: token, apiKey: credentials.apiKey };
  }

  private static async getTotp(secret: string) {
    const totp = generateTOTP(secret);
    return totp;
  }
}
