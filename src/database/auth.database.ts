import { db } from "@/config/drizzle.config.js";
import { ApiError } from "@/utils/ApiError.js";
import {
  broker_credentials,
  sessions,
  users,
} from "@/database/schema/index.js";
import { eq } from "drizzle-orm";

export const saveSession = async (
  sessionId: string,
  userId: string,
  expiresAt: Date
) => {
  try {
    const result = await db
      .insert(sessions)
      .values({ sessionId, userId, expiresAt })
      .returning({
        sessionId: sessions.sessionId,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      });

    return result[0];
  } catch (error) {
    throw new ApiError("Failed to save session", 500);
  }
};

export const getSession = async (sessionId: string) => {
  try {
    const result = await db
      .select({
        sessionId: sessions.sessionId,
        expiresAt: sessions.expiresAt,
        userId: sessions.userId,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.userId))
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);

    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    throw new ApiError("Failed to retrieve session", 500);
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    const result = await db
      .delete(sessions)
      .where(eq(sessions.sessionId, sessionId));
    return result;
  } catch (error) {
    throw new ApiError("Failed to delete session", 500);
  }
};

export const getOldSessionByUserId = async (userId: string) => {
  try {
    const result = await db
      .select({
        sessionId: sessions.sessionId,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    throw new ApiError("Failed to retrieve old session", 500);
  }
};

export const getUserWithPassword = async (email: string) => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        email: users.email,
        password: users.password,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

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
    const result = await db
      .insert(users)
      .values({ email, password: passwordHash, name, role: "user" })
      .returning({
        userId: users.userId,
        email: users.email,
        name: users.name,
      });
    if (result.length === 0)
      throw new ApiError("User registration failed", 500);

    return result[0];
  } catch (error) {
    throw new ApiError("Failed to register user", 500);
  }
};

export const initializeBrokerCredentials = async (userId: string) => {
  try {
    await db
      .insert(broker_credentials)
      .values({
        broker: "mstock",
        userId: userId,
        credentials: null,
      })
      .returning({
        broker: broker_credentials.broker,
        userId: broker_credentials.userId,
      });

    return;
  } catch (error) {
    throw new ApiError("Failed to initialize broker credentials", 500);
  }
};
