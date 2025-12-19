import { db } from "@/config/drizzle.config.js";
import { ApiError } from "@/utils/ApiError.js";
import { users, broker_credentials } from "@/database/schema/index.js";
import { eq } from "drizzle-orm";

export const findUserById = async (userId: string) => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        email: users.email,
        name: users.name,
        broker: broker_credentials.broker,
      })
      .from(users)
      .leftJoin(
        broker_credentials,
        eq(users.userId, broker_credentials.userId)
      )
      .where(eq(users.userId, userId))
      .limit(1);
    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    throw new ApiError("Unable to fetch user", 500);
  }
};

export const getUserWithPasswordById = async (userId: string) => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        password: users.password,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    throw new ApiError("Unable to fetch user", 500);
  }
};

export const updateUserPassword = async (
  userId: string,
  newPasswordHash: string
) => {
  try {
    const result = await db
      .update(users)
      .set({
        password: newPasswordHash,
      })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
      });
    if (result.length === 0) throw new ApiError("User not found", 404);

    return result[0];
  } catch (error) {
    throw new ApiError("Unable to update password", 500);
  }
};
