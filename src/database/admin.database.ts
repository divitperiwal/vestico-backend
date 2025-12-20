import { db } from "@/config/drizzle.config.js";
import { ApiError } from "@/utils/ApiError.js";
import { broker_credentials, users } from "@/database/schema/index.js";
import { eq } from "drizzle-orm";

export const getAllUsers = async () => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        name: users.name,
        email: users.email,
        strategy: users.strategy,
        createdAt: users.createdAt,
        role: users.role,
      })
      .from(users);
    if (result.length === 0) throw new ApiError("No users found", 404);
    return result;
  } catch (error) {
    throw new ApiError("Error fetching users from database", 500);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        name: users.name,
        email: users.email,
        strategy: users.strategy,
        createdAt: users.createdAt,
        role: users.role,
        broker: broker_credentials.broker,
      })
      .from(users)
      .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId))
      .where(eq(users.userId, userId));
    if (result.length === 0) throw new ApiError("User not found", 404);
    return result[0];
  } catch (error) {
    throw new ApiError("Error fetching user from database", 500);
  }
};

export const updateUserById = async (userId: string, updateData: any) => {
  try {
    await db.update(users).set(updateData).where(eq(users.userId, userId));
  } catch (error) {
    throw new ApiError("Error updating user in database", 500);
  }
};

export const getBrokerCredentialsById = async (userId: string) => {
  try {
    const result = await db
      .select({
        broker: broker_credentials.broker,
        credentials: broker_credentials.credentials,
        updatedAt: broker_credentials.updatedAt,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId));

    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    throw new ApiError("Error fetching broker credentials from database", 500);
  }
};

export const updateBrokerCredentialsById = async (
  userId: string,
  credentials: any
) => {
  try {
    await db
      .update(broker_credentials)
      .set({
        credentials: credentials,
        updatedAt: new Date(),
      })
      .where(eq(broker_credentials.userId, userId));
    return;
  } catch (error) {
    throw new ApiError("Error updating broker credentials in database", 500);
  }
};

export const getUserBroker = async (userId: string) => {
  try {
    const result = await db.select({
      broker: broker_credentials.broker,
    }).from(broker_credentials).where(eq(broker_credentials.userId, userId));

    if (result.length === 0) throw new ApiError("Broker not found for user", 404);
    return result[0];
  } catch (error) {
    throw new ApiError("Error fetching user broker from database", 500);
  }
}