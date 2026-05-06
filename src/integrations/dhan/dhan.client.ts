import { dhanApiClient, dhanAuthClient } from '@/utils/response/axios';

export const DhanClient = {
  generateAccessToken: async (clientId: string, pin: string, totp: string) => {
    const { data } = await dhanAuthClient.post('/app/generateAccessToken', {}, {
      params: { dhanClientId: clientId, pin, totp }
    })

    return { accessToken: data.accessToken, accessTokenExpiry: data.expiryTime };
  },

  getPortfolio: async (accessToken: string) => {
    const { data } = await dhanApiClient(accessToken, 'Failed to fetch Dhan portfolio').get('/holdings');
    return data;
  },

  getPositions: async (accessToken: string) => {
    const { data } = await dhanApiClient(accessToken, 'Failed to fetch Dhan positions').get('/positions');
    return data;
  },

  getFunds: async (accessToken: string) => {
    const { data } = await dhanApiClient(accessToken, 'Failed to fetch Dhan funds').get('/fundlimit');
    return data;
  },

}

