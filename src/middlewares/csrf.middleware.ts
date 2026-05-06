import { CSRF_HEADER_NAME } from '@/constant.js';
import { ApiError } from '@/utils/response/error.js';
import { readCsrfCookie } from '@/utils/response/cookies.js';
import type { Request, Response, NextFunction } from 'express';

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const csrfFromCookie = readCsrfCookie(req.headers.cookie || '');
    const csrfFromHeader = (req.headers[CSRF_HEADER_NAME.toLowerCase()] as string) || undefined;

    if (!csrfFromCookie || !csrfFromHeader) throw new ApiError('CSRF Token missing', 403);

    if (csrfFromCookie !== csrfFromHeader) throw new ApiError('Invalid CSRF Token', 403);

    next();
};