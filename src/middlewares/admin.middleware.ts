import { ApiError } from '@/utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';

export const checkAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  if (!userRole) throw new ApiError('Unauthorized', 401);
  if (userRole !== 'admin') throw new ApiError('Forbidden: Admins only', 403);
  next();
};
