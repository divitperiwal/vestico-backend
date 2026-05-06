import { DhanService } from '@/modules/broker/providers/dhan/dhan.service.js';
import { MstockService } from '@/modules/broker/providers/mstock/mstock.service.js';
import { ApiError } from '@/utils/response/error.js';
import type { Request, Response, NextFunction } from 'express';

export const accessTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const broker = req.user?.broker;

  switch (broker) {
    case 'dhan': {
      const { accessToken } = await DhanService.getAccessToken(req.user!.userId);
      req.accessToken = accessToken;
      break;
    }
    case 'mstock': {
      const { accessToken, apiKey } = await MstockService.getAccessToken(req.user!.userId);
      req.accessToken = accessToken;
      req.apiKey = apiKey;
      break;
    }
    default:
      throw new ApiError('Broker not supported', 400);
  }

  next();
};
