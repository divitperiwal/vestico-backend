import { ApiError } from '@/utils/constants/ApiError.js';
import axios from 'axios';

export class DhanClient {
  static async generateConsentToken(clientId: string, apiSecret: string, apiKey: string) {
    const URL = `https://auth.dhan.co/app/generate-consent?client_id=${clientId}`;
    try {
      const response = await axios.post(
        URL,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            app_id: apiKey,
            app_secret: apiSecret,
          },
        },
      );

      return response?.data?.consentAppId;
    } catch (error: any) {
      throw new ApiError(
        error.data.message || 'Failed to generate consent token',
        error.response?.status || 500,
      );
    }
  }

  static async consumeConsentToken(tokenId: string, apiKey: string, apiSecret: string) {
    const URL = `https://auth.dhan.co/app/consumeApp-consent?tokenId=${tokenId}`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          app_id: apiKey,
          app_secret: apiSecret,
        },
      });
      console.log(response.data)
      return {
        accessToken: response?.data?.accessToken,
        accessTokenExpiry: response?.data?.expiryTime,
      };
    } catch (error: any) {
      throw new ApiError(
        error.data.message || 'Failed to consume consent token',
        error.response?.status || 500,
      );
    }
  }

  static async getPortfolio(accessToken: string) {
    const URL = `https://api.dhan.co/v2/holdings`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          'access-token': accessToken,
        },
      });
      return response.data
    } catch (error) {
      throw new ApiError('Failed to fetch Dhan portfolio', 500);
    }
  }
}
