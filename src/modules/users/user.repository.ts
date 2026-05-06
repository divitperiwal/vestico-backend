import { db } from '@/config/database.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { users } from '@/database/schema/user.schema.js';
import { eq } from 'drizzle-orm';


export const UserRepository = {
  getUser: async (userId: string) => {
    const [user] = await db
      .select({
        userId: users.userId,
        username: users.username,
        role: users.role,
        email: users.email,
        name: users.name,
        strategy: users.strategy,
        createdAt: users.createdAt,
        broker: broker_credentials.broker,
      })
      .from(users)
      .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId))
      .where(eq(users.userId, userId))
      .limit(1);

    return user ?? null;
  },

  updatePassword: async (userId: string, newPasswordHash: string) => {
    const [result] = await db
      .update(users)
      .set({
        password: newPasswordHash,
      })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
      });

    return result ?? null;
  },

  getUserWithPassword: async (userId: string) => {
    const [user] = await db
      .select({
        userId: users.userId,
        password: users.password,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    return user ?? null;
  }
}

