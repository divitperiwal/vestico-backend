import { sendError } from '@/utils/response/response.js';
import { ApiError } from '@/utils/response/error.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) return sendError(res, error.statusCode, error.message, error.details);
  if (error.name === 'ValidationError') return sendError(res, 400, 'Validation Error', error);
  if (error.name === 'UnauthorizedError') return sendError(res, 401, 'Unauthorized Access', error);

  if (error instanceof ZodError)
    return sendError(res, 400, error.issues[0]?.message || 'Validation Error', error.issues);

  return sendError(
    res,
    500,
    error.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? error.stack : undefined,
  );
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  return sendError(res, 404, 'Route Not Found');
};
