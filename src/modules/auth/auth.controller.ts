// import { loginUser, logoutUser, registerUser } from '@/modules/auth/a.js';
import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { clearCsrfCookie, clearSessionCookie, readSessionCookie } from '@/utils/helper/cookies.js';
import { sendSuccess } from '@/utils/helper/response.js';
import { LoginUserSchema, RegisterUserSchema } from '@/types/validation/auth.validation.js';
import { AuthService } from './auth.service.js';

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = LoginUserSchema.parse(req.body);
  const { sessionCookie, csrfCookie, user } = await AuthService.loginUser(email, password);

  res.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);
  return sendSuccess(res, 200, 'Login Successfull', user);
});

export const handleRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = RegisterUserSchema.parse(req.body);
  const { sessionCookie, csrfCookie, user } = await AuthService.registerUser(email, password, name);

  res.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);

  sendSuccess(res, 201, 'User Registered Successfully', user);
});

export const handleLogout = asyncHandler(async (req, res) => {
  const sessionId = readSessionCookie(req.headers.cookie);
  if (sessionId) await AuthService.logoutUser(sessionId);
  res.setHeader('Set-Cookie', [clearSessionCookie(), clearCsrfCookie()]);
  sendSuccess(res, 200, 'Logout Successful');
});
