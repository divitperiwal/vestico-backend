
import { getUserAccessToken } from "@/services/mstock.service.js";
import { ApiError } from "@/utils/ApiError.js";
import type { Request, Response, NextFunction } from "express";
export const accessTokenMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    const {accessToken, apiKey} = await getUserAccessToken(req.user!.userId);
    if(!accessToken) throw new ApiError("Error fetching Mstock Access Token", 500);

    req.accessToken = accessToken;
    req.apiKey = apiKey;
    next();
}