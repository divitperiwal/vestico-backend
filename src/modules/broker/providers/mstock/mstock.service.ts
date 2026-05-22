import { ApiError } from "@/utils/response/error";
import { BrokerService } from "@/modules/broker/broker.service";
import { generateTOTP } from "@/utils/security/totp";
import { MstockClient } from "@/integrations/mstock/mstock.client";
import { getMiraeTokenExpiry } from "@/utils/parsers/expiry";
import { BrokerCache } from "@/modules/broker/broker.cache";
import { MarketCache } from "@/modules/market/market.cache";
import { InstrumentCache } from "@/modules/market/instrument.cache";
import { parseInstruments } from "@/utils/parsers/csv-parse";

export const MstockService = {
  generateAccessToken: async (userId: string) => {
    if (!userId) throw new ApiError('User ID not found', 404);
    const { apiKey, totpKey } = await BrokerService.getCredentials(userId);
    if (!apiKey || !totpKey) throw new ApiError('Mstock credentials not found', 404);

    const totp = generateTOTP(totpKey);
    const accessToken = await MstockClient.getAccessToken(apiKey, totp);

    if (!accessToken) throw new ApiError('Failed to generate access token', 500);

    const expiry = getMiraeTokenExpiry()

    await BrokerService.storeCredentials(userId, { apiKey, totpKey, accessToken, accessTokenExpiry: expiry });
    return { accessToken, apiKey, accessTokenExpiry: expiry };
  },

  getAccessToken: async (userId: string): Promise<{ accessToken: string; apiKey: string; }> => {
    const { accessToken, accessTokenExpiry, apiKey } = await BrokerService.getCredentials(userId);
    if (!accessToken || !accessTokenExpiry || new Date() >= new Date(accessTokenExpiry)) {
      const { accessToken, apiKey } = await MstockService.generateAccessToken(userId);
      return { accessToken, apiKey };
    }

    return { accessToken, apiKey };
  },

  // Other service methods like getFunds, getPortfolio, etc. will go here
  getPortfolio: async (userId: string, apiKey: string, token: string) => {
    const cached = await BrokerCache.getPortfolio(userId);
    if (cached) return cached;

    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);

    const portfolio = await MstockClient.getPortfolio(apiKey, token);
    BrokerCache.storePortfolio(userId, portfolio);

    return portfolio;
  },

  getFunds: async (userId: string, apiKey: string, token: string) => {
    const cached = await BrokerCache.getFunds(userId);
    if (cached) return cached;

    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);
    const funds = await MstockClient.getFunds(apiKey, token);
    BrokerCache.storeFunds(userId, funds);

    return funds;
  },

  getPositions: async (userId: string, apiKey: string, token: string) => {
    const cached = await BrokerCache.getPositions(userId);
    if (cached) return cached;

    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);

    const positions = await MstockClient.getPositions(apiKey, token);
    BrokerCache.storePositions(userId, positions);

    return positions;

  },

  //Universal Data Related Functions
  getIntradayData: async (apiKey: string, token: string, instrument_token: string) => {
    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);
    const data = await MstockClient.getIntradayData(apiKey, token, '1', instrument_token, 'minute');
    return data;
  },

  getOLHCData: async (apiKey: string, token: string, ticker: string[]) => {
    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);
    if (ticker.length === 0) throw new ApiError('Ticker list cannot be empty', 400);

    const data = await MstockClient.getOlhcData(apiKey, token, ticker);
    return data;

  },

  getTopMovers: async (apiKey: string, token: string) => {
    const cached = await MarketCache.getTopMovers();
    if (cached) return cached;

    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);


    const [gainers, losers] = await Promise.all([
      MstockClient.getTopMovers(apiKey, token, 'g'),
      MstockClient.getTopMovers(apiKey, token, 'l')
    ]);

    const movers = { gainers, losers };

    MarketCache.setTopMovers(movers);
    return { gainers, losers };

  },

  getInstruments: async (apiKey: string, token: string) => {
    if (!token || !apiKey) throw new ApiError('Access Token or API Key not found', 401);

    const response = await MstockClient.getInstruments(apiKey, token);
    const data = parseInstruments(response);

    if (!data || data.length === 0) throw new ApiError('Failed to parse instruments', 500);

    await InstrumentCache.setInstruments(data);
    return data;
  },

}