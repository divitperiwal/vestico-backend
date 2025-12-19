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
      s.session_id as "session_id", 
      s.expires_at as "expires_at", 
      s.user_id as "user_id",
      u.email as "email"
      FROM sessions s
      INNER JOIN users  u
        ON s.user_id = u.user_id
      WHERE s.session_id = ${sessionId}
      LIMIT 1
      `;

    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    throw new ApiError("Failed to retrieve session", 500);
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    await db`
      DELETE FROM sessions 
      WHERE session_id = ${sessionId}
    `;
  } catch (error) {
    throw new ApiError("Failed to delete session", 500);
  }
};

export const getOldSessionByUserId = async (userId: string) => {
  try {
    const result = await db`
      SELECT session_id
      FROM sessions
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    throw new ApiError("Failed to retrieve old session", 500);
  }
};

export const getUserWithPassword = async (email: string) => {
  try {
    const result = await db`
      SELECT 
      user_id, 
      email, 
      password,
      name
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;
    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    throw new ApiError("Failed to retrieve user", 500);
  }
};

export const registerUserData = async (
  email: string,
  passwordHash: string,
  name: string
) => {
  try {
    const result = await db`
    INSERT INTO users
    (email, password, name)
    VALUES
    (${email}, ${passwordHash}, ${name})
    RETURNING user_id, email, name
    `;

    return result[0];
  } catch (error) {
    throw new ApiError("Failed to register user", 500);
  }
};
