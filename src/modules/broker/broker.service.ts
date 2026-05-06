import { BrokerCache } from "@/modules/broker/broker.cache";
import { ApiError } from "@/utils/response/error";
import { decryptData, encryptData } from "@/utils/security/encryption";
import { BrokerDatabase } from "@/modules/broker/broker.repository";

export const BrokerService = {
  getCredentials: async (userId: string) => {
    if (!userId) throw new ApiError('User ID is required', 400);
    const cached = await BrokerCache.getCredentials(userId);
    if (cached) return JSON.parse(decryptData(cached));

    const response = await BrokerDatabase.getCredentials(userId);
    if (!response?.credentials) throw new ApiError('Broker credentials not found', 404);

    const decrypted = JSON.parse(decryptData(response.credentials));

    BrokerCache.storeCredentials(userId, response.credentials, decrypted.accessTokenExpiry)

    return decrypted;
  },

  //Needs Fixes with Credentials Types
  storeCredentials: async (userId: string, credentials: any) => {
    const encrypted = encryptData(JSON.stringify(credentials));
    await BrokerDatabase.storeCredentials(userId, encrypted);
    BrokerCache.storeCredentials(userId, encrypted, credentials.accessTokenExpiry)

    return;
  }

}


// static async getFilteredPortfolio(userId: string) {
//   const brokerContext = await this.resolveBrokerContext(userId);
//   const broker = brokerContext!.broker;
//   let portfolio: any[] = [];
//   switch (broker) {
//     case 'dhan':
//       portfolio = await DhanService.getPortfolio(userId, brokerContext!.accessToken);
//       break;
//     case 'mstock':
//       portfolio = await MstockService.getPortfolio(
//         brokerContext!.apiKey,
//         brokerContext!.accessToken,
//         userId,
//       );
//       break;
//   }
//   if (portfolio.length === 0) throw new ApiError('Portfolio is empty', 400);
//   const ETF_LIST = (await this.getETFList()).map((etf: any) => `${etf.ticker}`);
//   const name = broker === 'dhan' ? 'tradingSymbol' : 'tradingsymbol';
//   const filterport = portfolio
//     .filter((item) => ETF_LIST.some((etf: any) => etf == item[name]))
//     .map((item) => item[name]);
//   return filterport;
// }

// private static async getETFList() {
//   const ETF_LIST = await StrategyClient.getETFList();
//   if (!ETF_LIST || ETF_LIST.length === 0) throw new ApiError('Failed to fetch ETF list', 500);
//   return ETF_LIST;
// }