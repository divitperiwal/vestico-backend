import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { clearSessionCookie, readSessionCookie } from '@/utils/helper/cookies.js';
import { sendSuccess } from '@/utils/helper/response.js';
import { UserService } from './user.service.js';
import { AuthService } from '../auth/auth.service.js';

export const handleGetProfile = asyncHandler(async (req, res) => {
  const user = req?.user;
  const userData = await UserService.getUserProfile(user!.userId);

  sendSuccess(res, 200, 'User profile fetched successfully', userData);
});

export const handleChangePassword = asyncHandler(async (req, res) => {
  const user = req?.user;
  const sessionId = readSessionCookie(req.headers.cookie);
  const { oldPassword, newPassword } = req.body;

  await UserService.changePassword(user!.userId, oldPassword, newPassword);

  if (sessionId) await AuthService.logoutUser(sessionId);
  res.setHeader('Set-Cookie', [clearSessionCookie()]);

  sendSuccess(res, 200, 'Password changed successfully. Please login again.');
});

export const handleGetRecommendation = asyncHandler(async (req, res) => {
  const user = req?.user;
  const recommendations = await UserService.getUserRecommendation(user!.userId);
  sendSuccess(res, 200, 'Recommendation fetched successfully', recommendations);
  
});
