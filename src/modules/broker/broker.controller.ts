import { ApiError } from "@/utils/response/error";
import { DhanService } from "@/modules/broker/providers/dhan/dhan.service";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";
import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/response/response";

export const BrokerController = {
    getPortfolio: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        switch (user.broker) {
            case 'dhan':
                const dhan = await DhanService.getPortfolio(user.userId, req.accessToken)
                sendSuccess(res, 200, 'Portfolio fetched successfully', dhan);
                break;
            case 'mstock':
                const mstock = await MstockService.getPortfolio(user.userId, req.apiKey!, req.accessToken)
                sendSuccess(res, 200, 'Portfolio fetched successfully', mstock);
                break;
        }

        return;
    },
    getFunds: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        switch (user.broker) {
            case 'dhan':
                const dhan = await DhanService.getFunds(user.userId, req.accessToken)
                sendSuccess(res, 200, 'Funds fetched successfully', dhan);
                break;
            case 'mstock':
                const mstock = await MstockService.getFunds(user.userId, req.apiKey!, req.accessToken)
                sendSuccess(res, 200, 'Funds fetched successfully', mstock);
                break;
        }
        return;
    },
    getPositions: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        switch (user.broker) {
            case 'dhan':
                const dhan = await DhanService.getPositions(user.userId, req.accessToken)
                sendSuccess(res, 200, 'Positions fetched successfully', dhan);
                break;
            case 'mstock':
                const mstock = await MstockService.getPositions(user.userId, req.apiKey!, req.accessToken)
                sendSuccess(res, 200, 'Positions fetched successfully', mstock);
                break;
        }
        return;
    }
}