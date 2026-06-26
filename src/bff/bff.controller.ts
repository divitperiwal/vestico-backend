import type { Request, Response } from "express";
import { BFFService } from "./bff.service";
import { ApiError } from "@/utils/response/error";
import { sendSuccess } from "@/utils/response/response";
import { asyncHandler } from "@/utils/response/async";

export const BFFController = {
    Mobile: {
        getDashboard: asyncHandler(async (req: Request, res: Response) => {
            const user = req.user;
            const data = await BFFService.getDashboard(user);
            sendSuccess(res, 200, "Dashboard data retrieved successfully", data);
        })
    }
};