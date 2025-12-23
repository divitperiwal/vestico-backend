// import { getDhanAccessToken } from '@/broker/dhan/dhan.service.js';
import { DhanService } from '@/modules/broker/dhan/dhan.service.js';
import { MstockService } from '@/modules/broker/mstock/mstock.service.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import type { Request, Response, NextFunction } from 'express';
export const accessTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const broker = req.user?.broker;
  if (broker === 'mstock') {
    const { accessToken, apiKey } = await MstockService.getAccessToken(req.user!.userId);
    if (!accessToken) throw new ApiError('Error fetching Mstock Access Token', 500);
    req.accessToken = accessToken;
    req.apiKey = apiKey;
  }

  const { accessToken } = await DhanService.getDhanAccessToken(req.user!.userId);
  req.accessToken = accessToken;

  next();
};
