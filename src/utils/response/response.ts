import type { SuccessResponse, ErrorResponse } from '@/types/common.js';
import type { Request, Response } from 'express';
import { ApiError } from '@/utils/response/error.js';
import { AuthService } from '@/modules/auth/auth.service.js';

export const sendSuccess = (res: Response, statusCode = 200, message = 'Success', data?: any) => {
  const response: SuccessResponse = {
    success: true,
    statusCode,
    message,
  };
  if (data) response.data = data;

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode = 500,
  message = 'Internal Server Error',
  errors?: any,
) => {
  const response: ErrorResponse = {
    success: false,
    statusCode,
    message,
  };
  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

export const runAuthMiddlewareWS = async (req: Request) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get("session");
  if (!sessionId) throw new ApiError('Unauthorized', 401);

  const data = await AuthService.validateSession(sessionId);
  if (!data) throw new ApiError('Unauthorized', 401);

  if (!data.userId || !data.email || !data.sessionId || !data.role) {
    throw new ApiError('Unauthorized', 401);
  }
  req.user = {
    userId: data.userId,
    email: data.email,
    sessionId: data.sessionId,
    broker: data.broker,
    role: data.role,
  };

  return;
}