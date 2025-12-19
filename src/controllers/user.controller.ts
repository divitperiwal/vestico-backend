import { logoutUser } from "@/services/auth.service.js";
import { changeUserPassword, getUserProfile } from "@/services/user.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { clearCsrfCookie, clearSessionCookie, readSessionCookie } from "@/utils/cookies.js";
import { sendSuccess } from "@/utils/response.js";

export const handleGetProfile = asyncHandler(async (req, res) => {
  const user = req?.user;
  const userData = await getUserProfile(user!.userId);

  sendSuccess(res, 200, "User profile fetched successfully", userData);
});

export const handleChangePassword = asyncHandler(async (req, res) => {
  const user = req?.user;
  const sessionId = readSessionCookie(req.headers.cookie);
  const { oldPassword, newPassword } = req.body;

  await changeUserPassword(user!.userId, oldPassword, newPassword);

  if (sessionId) await logoutUser(sessionId);
  res.setHeader("Set-Cookie", [clearSessionCookie(), clearCsrfCookie()]);
  
  sendSuccess(res, 200, "Password changed successfully. Please login again.");
});
