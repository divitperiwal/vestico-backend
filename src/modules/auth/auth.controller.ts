import { asyncHandler } from '@/utils/response/async.js';
import { clearCsrfCookie, clearSessionCookie, readSessionCookie } from '@/utils/response/cookies.js';
import { sendSuccess } from '@/utils/response/response.js';
import { LoginUserSchema } from './auth.validation';
import { AuthService } from '@/modules/auth/auth.service.js';
import type { Request, Response } from 'express';

export const AuthController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = LoginUserSchema.parse(req.body);
    const { sessionCookie, csrfCookie, user } = await AuthService.login(username, password);

    res.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);
    sendSuccess(res, 200, 'Login Successfull', user);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const sessionId = readSessionCookie(req.headers.cookie);
    if (sessionId) await AuthService.logout(sessionId);
    res.setHeader('Set-Cookie', [clearSessionCookie(), clearCsrfCookie()]);
    sendSuccess(res, 200, 'Logout Successful');
  })
}
