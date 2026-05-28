import { BrokerCache } from "@/modules/broker/broker.cache";
import { ApiError } from "@/utils/response/error";
import { decryptData, encryptData } from "@/utils/security/encryption";
import { BrokerDatabase } from "@/modules/broker/broker.repository";
import type { User } from "@/types/common";
import { MstockService } from "./providers/mstock/mstock.service";
import { DhanAdapter } from "./providers/dhan/dhan.adapter";
import { DhanService } from "./providers/dhan/dhan.service";
import { MstockAdapter } from "./providers/mstock/mstock.adapter";

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
  },


  getPortfolio: async (userId: string, broker: string, accessToken: string, apiKey?: string) => {
    switch (broker) {

      case 'dhan':
        const dhan = await DhanService.getPortfolio(userId, accessToken)
        const dportfolio = DhanAdapter.normalizeHoldings(dhan);
        return dportfolio;

      case 'mstock':
        const mstock = await MstockService.getPortfolio(userId, apiKey!, accessToken)
        const mportfolio = MstockAdapter.normalizeHoldings(mstock);
        return mportfolio;

      default:
        throw new ApiError('Unsupported broker', 400);
    }
  },

  getFunds: async (userId: string, broker: string, accessToken: string, apiKey?: string) => {
    switch (broker) {

      case 'dhan':
        const dhan = await DhanService.getFunds(userId, accessToken)
        const dfunds = DhanAdapter.normalizeFunds(dhan);
        return dfunds;

      case 'mstock':
        const mstock = await MstockService.getFunds(userId, apiKey!, accessToken)
        const mfunds = MstockAdapter.normalizeFunds(mstock);
        return mfunds;

      default:
        throw new ApiError('Unsupported broker', 400);
    }
  },

  getPositions: async (userId: string, broker: string, accessToken: string, apiKey?: string) => {
    switch (broker) {

      case 'dhan':
        const dhan = await DhanService.getPositions(userId, accessToken)
        const dpositions = DhanAdapter.normalizePositions(dhan);
        return dpositions;

      case 'mstock':
        const mstock = await MstockService.getPositions(userId, apiKey!, accessToken)
        const mpositions = MstockAdapter.normalizePositions(mstock);
        return mpositions;

      default:
        throw new ApiError('Unsupported broker', 400);
    }

  }
}


