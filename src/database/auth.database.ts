import { db } from "@/config/db.config.js";
import { ApiError } from "@/utils/ApiError.js";

export const saveSession = async (
  sessionId: string,
  userId: string,
  expiresAt: Date
) => {
  try {
    const result = await db`
    INSERT 
    INTO sessions 
    (session_id, user_id, expires_at) 
    VALUES (${sessionId}, ${userId}, ${expiresAt}) 
    RETURNING *`;

    return result;
  } catch (error) {
    throw new ApiError("Failed to save session", 500);
  }
};

export const getSession = async (sessionId: string) => {
  try {
    const result = await db`
      SELECT 
      session_id as "sessionId", 
      expires_at as "expiresAt", 
      user_id as "userId" 
      FROM sessions WHERE session_id = ${sessionId}
      INNER JOIN users ON sessions.user_id = users.user_id
      WHERE sessions.session_id = ${sessionId}
      AND sessions.expires_at > NOW()
      LIMIT 1
      `;

    return result;
  } catch (error) {
    throw new ApiError("Failed to retrieve session", 500);
  }
};
