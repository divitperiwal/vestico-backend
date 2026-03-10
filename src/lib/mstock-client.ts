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
        headers: {
          'X-Mirae-Version': '1',
          'Authorization': `token ${apiKey}:${token}`
        }
      })
    } catch (error: any) {
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
        error.response.statusText || 'Failed to fetch Mstock Portfolio',
        error.response.status || 500,
      );
    }
  }

  static async getPositions(apiKey: string, token: string) {
    const URL = `https://api.mstock.trade/openapi/typea/portfolio/positions`;
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
        error.response.statusText || 'Failed to fetch Mstock Positions',
        error.response.status || 500,
      );
    }
  }

  static async getOlhcData(apiKey: string, token: string, ticker: string) {
    const URL = `https://api.mstock.trade/openapi/typea/instruments/quote/ohlc`;
    const params = new URLSearchParams();
    params.append('i', ticker);
    try {
      const response = await axios.get(URL, {
        params,
        headers: {
          'X-Mirae-Version': '1',
          'Content-Type': 'application/json',
          Authorization: `token ${apiKey}:${token}`,
        }
      })
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response.statusText || 'Failed to fetch Mstock OHLC data',
        error.response.status || 500,
      );
    }
  }

  static async getTopMovers(apiKey: string, token: string, type: string) {
    const URL = `https://api.mstock.trade/openapi/typea/losergainer`
    try {
      const response = await axios.post(URL, {
        'Exchange': '1',
        'SecurityIdCode': '13',
        'segment': '1',
        'TypeFlag': (type == 'g') ? 'G' : 'L',

      }, {
        headers: {
          'X-Mirae-Version': '1',
          'Authorization': `token ${apiKey}:${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response.statusText || 'Failed to fetch Mstock Top Movers',
        error.response.status || 500,
      )
    }
  }
  static async getIntradayData(apiKey: string, token: string, ticker: string) {
    const URL = `https://api.mstock.trade/openapi/typea/instruments/intraday/{exchange}/{instrument_token}/{interval}`;
  }
}
