import { ApiError } from "@/utils/response/error";
import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/response/response";
import { BrokerService } from "./broker.service";

export const BrokerController = {
    getPortfolio: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user || !user.broker) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        const portfolio = await BrokerService.getPortfolio(user.userId, user.broker, req.accessToken, req.apiKey);
        sendSuccess(res, 200, 'Portfolio fetched successfully', portfolio);
    },

    getFunds: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user || !user.broker) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);
        const funds = await BrokerService.getFunds(user.userId, user.broker, req.accessToken, req.apiKey);
        sendSuccess(res, 200, 'Funds fetched successfully', funds);
    },

    getPositions: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user || !user.broker) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        const positions = await BrokerService.getPositions(user.userId, user.broker, req.accessToken, req.apiKey);
        sendSuccess(res, 200, 'Positions fetched successfully', positions);
    }
}
