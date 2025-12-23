import { ApiError } from '@/utils/constants/ApiError.js';
import { BrokerService } from '../broker.service.js';
import { DhanClient } from '@/lib/dhan-client.js';

export class DhanService {
  static async getDhanAccessToken(userId: string) {
    const credentials = await BrokerService.getCredentials(userId);
    if (
      !credentials.accessToken ||
      !credentials.accessTokenExpiry ||
      new Date() >= new Date(credentials.accessTokenExpiry)
    )
      throw new ApiError('Dhan Access Token Expired, Please Generate a new one', 401);

    return { accessToken: credentials.accessToken };
  }

  static async getPortfolio(accessToken: string) {
    if(!accessToken) throw new ApiError('Access Token not found', 404);
    const portfolio = await DhanClient.getPortfolio(accessToken);
    if (!portfolio) throw new ApiError('Failed to fetch Dhan portfolio', 500);
    return portfolio;
  }
  static async generateAccessToken(userId: string) {
    const credentials = await BrokerService.getCredentials(userId);
    if (!credentials.clientId) throw new ApiError('Client ID not found', 404);
    if (!credentials.apiSecret) throw new ApiError('Api Secret not found', 404);
    if (!credentials.apiKey) throw new ApiError('Api Key not found', 404);

    //Generate Access Token
    const token = await DhanClient.generateConsentToken(
      credentials.clientId,
      credentials.apiSecret,
      credentials.apiKey,
    );

    if (!token) throw new ApiError('Failed to generate consent token', 500);
    const tokenURL = `https://auth.dhan.co/login/consentApp-login?consentAppId=${token}`;
    return tokenURL;
  }

  static async consumeConsentToken(userId: string, tokenId: string) {
    if (!userId) throw new ApiError('User ID not found', 404);
    if (!tokenId) throw new ApiError('Token ID not found', 404);
    const credentials = await BrokerService.getCredentials(userId);
    if (!credentials.apiKey) throw new ApiError('API Key not found', 404);
    if (!credentials.apiSecret) throw new ApiError('API Secret not found', 404);
    if (!credentials.clientId) throw new ApiError('Client ID not found', 404);

    //Consume Consent Token
    const { accessToken, accessTokenExpiry } = await DhanClient.consumeConsentToken(
      tokenId,
      credentials.apiKey,
      credentials.apiSecret,
    );
    if (!accessToken || !accessTokenExpiry)
      throw new ApiError('Failed to consume consent token', 500);

    await BrokerService.encryptAndStoreCredentials(userId, {
      ...credentials,
      accessToken,
      accessTokenExpiry,
    });

    return { accessToken, accessTokenExpiry };
  }
}
