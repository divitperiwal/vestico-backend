import { asyncHandler } from "@/utils/constants/asyncHandler";
import type { Request, Response } from "express";
import { DhanService } from "@/modules/broker/dhan/dhan.service";
import { ApiError } from "@/utils/constants/ApiError";
import { sendSuccess } from "@/utils/helper/response";

export const DhanController = {
  getPortfolio: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const accessToken = req.accessToken;
    if (!userId) throw new ApiError('User ID not found', 404);

    const portfolio = await DhanService.getPortfolio(userId, accessToken);
    sendSuccess(res, 200, 'Dhan Portfolio fetched successfully', portfolio);
  })
}