import { asyncHandler } from "@/utils/response/async";
import type { Request, Response } from "express";
import { DhanService } from "./dhan.service"
import { ApiError } from "@/utils/response/error";
import { sendSuccess } from "@/utils/response/response";

export const DhanController = {
  getPortfolio: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const accessToken = req.accessToken;
    if (!userId) throw new ApiError('User ID not found', 404);

    const portfolio = await DhanService.getPortfolio(userId, accessToken!);
    sendSuccess(res, 200, 'Dhan Portfolio fetched successfully', portfolio);
  }),

  getPositions: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const accessToken = req.accessToken;

    const positions = await DhanService.getPositions(userId!, accessToken!);
    sendSuccess(res, 200, 'Dhan Positions fetched successfully', positions);
  }),

  getFunds: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const accessToken = req.accessToken;

    const funds = await DhanService.getFunds(userId!, accessToken!);
    sendSuccess(res, 200, 'Dhan Funds fetched successfully', funds);
  })
}