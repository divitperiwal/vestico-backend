import { ApiError } from "@/utils/response/error";
import { DhanService } from "@/modules/broker/providers/dhan/dhan.service";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";
import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/response/response";
import { DhanAdapter } from "./providers/dhan/dhan.adapter";
import { MstockAdapter } from "./providers/mstock/mstock.adapter";

export const BrokerController = {
    getPortfolio: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) throw new ApiError('User not authenticated', 401);
        if (!req.accessToken) throw new ApiError('Access token is required', 400);

        switch (user.broker) {
            case 'dhan':
                const dhan = await DhanService.getPortfolio(user.userId, req.accessToken)
                const dportfolio = DhanAdapter.normalizeHoldings(dhan);
                sendSuccess(res, 200, 'Portfolio fetched successfully', dportfolio);
                break;
            case 'mstock':
                const mstock = await MstockService.getPortfolio(user.userId, req.apiKey!, req.accessToken)
                const mportfolio = MstockAdapter.normalizeHoldings(mstock);
                sendSuccess(res, 200, 'Portfolio fetched successfully', mportfolio);
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
                const dfunds = DhanAdapter.normalizeFunds(dhan);
                sendSuccess(res, 200, 'Funds fetched successfully', dfunds);
                break;
            case 'mstock':
                const mstock = await MstockService.getFunds(user.userId, req.apiKey!, req.accessToken)
                const mfunds = MstockAdapter.normalizeFunds(mstock);
                sendSuccess(res, 200, 'Funds fetched successfully', mfunds);
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