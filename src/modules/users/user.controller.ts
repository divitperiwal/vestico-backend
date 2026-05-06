import { asyncHandler } from '@/utils/response/async.js';
import { clearSessionCookie, readSessionCookie } from '@/utils/response/cookies.js';
import { sendSuccess } from '@/utils/response/response.js';
import { UserService } from './user.service.js';
import { AuthService } from '../auth/auth.service.js';
import type { Request, Response } from 'express';
import { changePasswordSchema } from './user.validation.js';


export const UserController = {
  getUser: asyncHandler(async (req: Request, res: Response) => {
    const user = req?.user;
    const data = await UserService.getUser(user!.userId);
    sendSuccess(res, 200, 'User fetched successfully', data);
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const user = req?.user;
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const sessionId = readSessionCookie(req.headers.cookie);

    await UserService.changePassword(user!.userId, oldPassword, newPassword);

    if (sessionId) await AuthService.logout(sessionId);
    res.setHeader('Set-Cookie', [clearSessionCookie()]);

    sendSuccess(res, 200, 'Password changed successfully. Please login again.');
  }),

  getRecommendation: asyncHandler(async (req: Request, res: Response) => {
    const user = req?.user;
    const recommendations = await UserService.getRecommendation(user!.userId);
    sendSuccess(res, 200, 'Recommendation fetched successfully', recommendations);
  })
}
