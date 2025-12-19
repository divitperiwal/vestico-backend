import { validateSession } from "@/services/auth.service.js";
import { ApiError } from "@/utils/ApiError.js";
import { readSessionCookie } from "@/utils/cookies.js";
import type { Request, Response, NextFunction } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = readSessionCookie(req.headers.cookie);
  if (!sessionId) throw new ApiError("Unauthorized", 401);

  const data = await validateSession(sessionId);
  if (!data) throw new ApiError("Unauthorized", 401);

  if (!data.userId || !data.email || !data.sessionId || !data.role) {
    throw new ApiError("Unauthorized", 401);
  }
  req.user = {
    userId: data.userId,
    email: data.email,
    sessionId: data.sessionId,
    role: data.role,
  };
  next();
};
