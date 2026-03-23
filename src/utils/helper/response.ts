import type { SuccessResponse, ErrorResponse } from '@/types/common.js';
import type { Response } from 'express';

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

export const runAuthMiddleware = (req: any, middleware: any) => {
  return new Promise((resolve, reject) => {

    try {

      const result = middleware(req, {} as any, (err: any) => {
        if (err) return reject(err);
        resolve(true);
      });

      // handle async middleware
      if (result instanceof Promise) {
        result.catch(reject);
      }

    } catch (err) {
      reject(err);
    }

  });
};