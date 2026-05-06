import { ApiError } from "@/utils/response/error";
import { BrokerService } from "@/modules/broker/broker.service";
import { generateTOTP } from "@/utils/security/totp";
import { DhanClient } from "@/integrations/dhan/dhan-client";
import { BrokerCache } from "@/modules/broker/broker.cache";

export const DhanService = {
    generateAccessToken: async (userId: string) => {
        if (!userId) throw new ApiError('User ID not found', 404);
        const { clientId, totpKey, pin } = await BrokerService.getCredentials(userId);
        if (!clientId || !totpKey || !pin) throw new ApiError('Dhan credentials not found', 404);
        const totp = generateTOTP(totpKey);

        const { accessToken, accessTokenExpiry } = await DhanClient.generateAccessToken(clientId, pin, totp);
        await BrokerService.storeCredentials(userId, { clientId, totpKey, pin, accessToken, accessTokenExpiry });

        return { accessToken, accessTokenExpiry };
    },
    getAccessToken: async (userId: string): Promise<{ accessToken: string; accessTokenExpiry: string }> => {
        const { accessToken, accessTokenExpiry } = await BrokerService.getCredentials(userId);

        if (!accessToken || !accessTokenExpiry || new Date() > new Date(accessTokenExpiry)) {
            const { accessToken, accessTokenExpiry } = await DhanService.generateAccessToken(userId);
            return { accessToken, accessTokenExpiry };
        }

        return { accessToken, accessTokenExpiry };
    },

    getPortfolio: async (userId: string, accessToken: string) => {
        const cached = await BrokerCache.getPortfolio(userId);
        if (cached != null) return cached;
        if (!accessToken) throw new ApiError('Access token not found', 404);

        const portfolio = await DhanClient.getPortfolio(accessToken);
        BrokerCache.storePortfolio(userId, portfolio);
        return portfolio;
    },
    getFunds: async (userId: string, accessToken: string) => {
        const cached = await BrokerCache.getFunds(userId);
        if (cached != null) return cached;
        if (!accessToken) throw new ApiError('Access token not found', 404);

        const funds = await DhanClient.getFunds(accessToken);
        BrokerCache.storeFunds(userId, funds);
        return funds;
    },
    getPositions: async (userId: string, accessToken: string) => {
        const cached = await BrokerCache.getPositions(userId);
        if (cached != null) return cached;
        
        if (!accessToken) throw new ApiError('Access token not found', 404);
        const positions = await DhanClient.getPositions(accessToken);
        BrokerCache.storePositions(userId, positions);
        return positions;
    }
}