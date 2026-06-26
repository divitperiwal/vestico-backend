import { BrokerService } from "@/modules/broker/broker.service";
import { DhanService } from "@/modules/broker/providers/dhan/dhan.service";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";
import { UserService } from "@/modules/users/user.service";
import type { User } from "@/types/common";
import { ApiError } from "@/utils/response/error";

export const BFFService = {
    getDashboard: async (user: User | undefined) => {
        if (!user) throw new ApiError("Unauthorized", 401);
        switch (user.broker) {
            case "dhan":
                const { accessToken: dhanToken } = await DhanService.getAccessToken(user.userId)
                const [portfolio, recommendation] = await Promise.all([
                    BrokerService.getPortfolio(user.userId, user.broker, dhanToken),
                    UserService.getRecommendation(user.userId)
                ])
                return { portfolio, recommendation }
            case "mstock":
                const { apiKey, accessToken } = await MstockService.getAccessToken(user.userId)
                const [mstockPortfolio, mstockRecommendation] = await Promise.all([
                    BrokerService.getPortfolio(user.userId, user.broker, accessToken, apiKey),
                    UserService.getRecommendation(user.userId)
                ])
                return { portfolio: mstockPortfolio, recommendation: mstockRecommendation }

            default:
                throw new ApiError("Invalid broker", 400);
        }


    }
};
