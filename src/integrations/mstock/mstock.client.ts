import { mstockApiClient, mstockAuthClient } from '@/utils/response/axios';


export const MstockClient = {
  getAccessToken: async (apiKey: string, totp: string) => {
    const { data } = await mstockAuthClient.post('/session/verifytotp', new URLSearchParams({
      api_key: apiKey,
      totp: totp
    })
    )
    return data.data.access_token;
  },

  getPortfolio: async (apiKey: string, token: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock portfolio').get('/portfolio/holdings');
    return data.data;
  },

  getPositions: async (apiKey: string, token: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock positions').get('/portfolio/positions');
    return data.data;
  },

  getFunds: async (apiKey: string, token: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock funds').get('/user/fundsummary');
    return data.data;
  },

  getOlhcData: async (apiKey: string, token: string, ticker: string[]) => {
    const params = new URLSearchParams();
    for (const t of ticker) {
      params.append('i', `NSE:${t}-EQ`);
    }
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock OHLC data').get('/instruments/quote/ohlc', { params });
    return data.data;
  },

  getTopMovers: async (apiKey: string, token: string, type: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock Top Movers').post('/losergainer', new URLSearchParams({
      'Exchange': '1',
      'SecurityIdCode': '13',
      'segment': '1',
      'TypeFlag': (type == 'g') ? 'G' : 'L',
    }));
    return data.data;
  },

  getIntradayData: async (apiKey: string, token: string, exchange: string, instrumentToken: string, interval: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock Intraday data').get(`/instruments/intraday/${exchange}/${instrumentToken}/${interval}`);
    return data.data;
  },

  getInstruments: async (apiKey: string, token: string) => {
    const { data } = await mstockApiClient(apiKey, token, 'Failed to fetch Mstock Instruments data').get('/instruments/scriptmaster');
    return data;
  }
}

