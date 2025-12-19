import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/auth.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clearSessionCookie, readSessionCookie } from "@/utils/cookies.js";
import { sendSuccess } from "@/utils/response.js";

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { sessionCookie, user } = await loginUser(email, password);

  res.setHeader("Set-Cookie", sessionCookie);
  return sendSuccess(res, 200, "Login Successfull", user);
});

export const handleRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const { sessionCookie, user } = await registerUser(email, password, name);

  res.setHeader("Set-Cookie", sessionCookie);

  sendSuccess(res, 201, "User Registered Successfully", user);
});

export const handleLogout = asyncHandler(async (req, res) => {
  const sessionId = readSessionCookie(req.headers.cookie);
  if (sessionId) await logoutUser(sessionId);

  res.setHeader("Set-Cookie", clearSessionCookie());
  sendSuccess(res, 200, "Logout Successful");
});
