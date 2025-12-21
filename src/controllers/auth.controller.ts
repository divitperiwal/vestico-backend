import { loginUser, logoutUser, registerUser } from '@/services/auth.service.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { clearCsrfCookie, clearSessionCookie, readSessionCookie } from '@/utils/cookies.js';
import { sendSuccess } from '@/utils/response.js';
import { LoginUserSchema, RegisterUserSchema } from '@/types/validation/auth.validation.js';

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = LoginUserSchema.parse(req.body);
  const { sessionCookie, csrfCookie, user } = await loginUser(email, password);

  res.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);
  return sendSuccess(res, 200, 'Login Successfull', user);
});

export const handleRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = RegisterUserSchema.parse(req.body);
  const { sessionCookie, csrfCookie, user } = await registerUser(email, password, name);

  res.setHeader('Set-Cookie', [sessionCookie, csrfCookie]);

  sendSuccess(res, 201, 'User Registered Successfully', user);
});

export const handleLogout = asyncHandler(async (req, res) => {
  const sessionId = readSessionCookie(req.headers.cookie);
  if (sessionId) await logoutUser(sessionId);

  res.setHeader('Set-Cookie', [clearSessionCookie(), clearCsrfCookie()]);
  sendSuccess(res, 200, 'Logout Successful');
});
