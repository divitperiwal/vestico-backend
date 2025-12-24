import { ApiError } from '@/utils/constants/ApiError.js';
import axios from 'axios';

export class MstockClient {
  static async getAccessToken(apiKey: string, totp: string) {
    try {
      const URL = `https://api.mstock.trade/openapi/typea/session/verifytotp`;
      const response = await axios.post(
        URL,
        new URLSearchParams({
          api_key: apiKey,
          totp: totp,
        }),
        {
          headers: {
            'X-Mirae-Version': '1',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.data.access_token;
    } catch (error: any) {
      throw new ApiError(
        error.response.data?.message || 'Failed to generate Mstock Access Token',
        error.response.status || 500,
      );
    }
  }

  static async logout(apiKey: string, token: string) {
    const URL = `https://api.mstock.trade/openapi/typea/logout`;
    try {
      await axios.get(URL, {
        headers:{
          'X-Mirae-Version': '1',
          'Authorization' : `token ${apiKey}:${token}`
        }
      })
    } catch (error:any) {
      throw new ApiError(
        error.response.data?.message || 'Failed to logout from Mstock',
        error.response.status || 500,
      );
    }
  }

  static async getFunds(apiKey: string, token: string) {
    const URL = `https://api.mstock.trade/openapi/typea/user/fundsummary`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'X-Mirae-Version': '1',
          'Content-Type': 'application/json',
          Authorization: `token ${apiKey}:${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response.data?.message || 'Failed to fetch Mstock Funds',
        error.response.status || 500,
      );
    }
  }

  static async getPortfolio(apiKey: string, token: string) {
    const URL = `https://api.mstock.trade/openapi/typea/portfolio/holdings`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'X-Mirae-Version': '1',
          'Content-Type': 'application/json',
          Authorization: `token ${apiKey}:${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response.data?.message || 'Failed to fetch Mstock Portfolio',
        error.response.status || 500,
      );
    }
  }
}
