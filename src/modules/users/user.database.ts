import { db } from '@/config/drizzle.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { users } from '@/database/schema/user.schema.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { eq } from 'drizzle-orm';

export class UserDatabase {
  static async getUser(userId: string) {
    const [user] = await db
      .select({
        userId: users.userId,
        username : users.username,
        role: users.role,
        email: users.email,
        name: users.name,
        strategy: users.strategy,
        createdAt : users.createdAt,
        broker: broker_credentials.broker,
      })
      .from(users)
      .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId))
      .where(eq(users.userId, userId))
      .limit(1);

    return user ?? null;
  }

  static async updateUserPassword(userId: string, newPasswordHash: string) {
    const [result] = await db
      .update(users)
      .set({
        password: newPasswordHash,
      })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
      });

    if (!result) throw new ApiError('User not found', 404);

    return result;
  }
}
