import type { ApiErrorResponse } from '@/types/common.js';

export class ApiError extends Error {
  public statusCode: number;
  public status: any;
  public details: any;

  constructor(message: string, statusCode: number, status?: any, details?: any) {
    super(message);
    this.name = this.constructor.name;

    this.statusCode = statusCode;
    this.status = status;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    const response: ApiErrorResponse = {
      success: false,
      statusCode: this.status,
      message: this.message,
      code: this.statusCode,
    };

    if (process.env.NODE_ENV === 'development' && this.details) {
      response.details = this.details;
    }
    return response;
  }
}

export function setupGlobalErrorHandlers() {
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION", err);
  });

  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
  });
}