import { db } from "@/config/db.config.js";
import { ApiError } from "@/utils/ApiError.js";

export const findUserById = async (userId: string) => {
  try {
    const result = await db`
    SELECT 
        u.user_id,
        u.email,
        u.name,
        bc.broker
    FROM users u
    LEFT JOIN broker_credentials bc
        ON bc.user_id = u.user_id
    WHERE u.user_id = ${userId}
    LIMIT 1;
    `;
    if (result.length === 0) return null;

    return result[0];
  } catch (error) {
    throw new ApiError("Unable to fetch user", 500);
  }
};

export const getUserWithPasswordById = async (userId: string) => {
  try {
    const result = await db`
    SELECT 
        user_id,password
    FROM users
    WHERE user_id = ${userId}
    LIMIT 1;
    `;
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
    const result = await db`
    UPDATE users
    SET password = ${newPasswordHash}
    WHERE user_id = ${userId}
    RETURNING user_id
    `;
    if (result.length === 0) throw new ApiError("User not found", 404);

    return result[0];
  } catch (error) {
    throw new ApiError("Unable to update password", 500);
  }
};
