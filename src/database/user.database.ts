import { db } from '@/config/drizzle.config.js';
import { ApiError } from '@/utils/ApiError.js';
import { users, broker_credentials } from '@/database/schema/index.js';
import { eq } from 'drizzle-orm';

export const getUser = async (userId: string) => {
  const [user] = await db
    .select({
      userId: users.userId,
      role: users.role,
      email: users.email,
      name: users.name,
      broker: broker_credentials.broker,
    })
    .from(users)
    .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId))
    .where(eq(users.userId, userId))
    .limit(1);

  return user ?? null;
};

export const updateUserPassword = async (userId: string, newPasswordHash: string) => {
  const [result] = await db
    .update(users)
    .set({
      password: newPasswordHash,
    })
    .where(eq(users.userId, userId))
    .returning({
      userId: users.userId,
    });

  if (!userId) throw new ApiError('User not found', 404);

  return result;
};
