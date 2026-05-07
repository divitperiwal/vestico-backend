import { db } from '@/config/database.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { type Broker, type Strategy } from '@/database/schema/enums.schema.js';
import { etf } from '@/database/schema/etf.schema.js';
import { sessions } from '@/database/schema/session.schema.js';
import { users } from '@/database/schema/user.schema.js';
import { ApiError } from '@/utils/response/error.js';
import { eq } from 'drizzle-orm';

export const AdminDatabase = {
  createUser: async (
    username: string,
    email: string,
    password: string,
    name: string,
    broker: Broker,
    strategy: Strategy,
  ) => {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          username,
          email,
          password,
          name,
          strategy,
        })
        .onConflictDoNothing()
        .returning({
          userId: users.userId,
        });
      if (!user) throw new ApiError('User with the same username or email already exists', 409);
      await tx.insert(broker_credentials).values({
        userId: user.userId,
        broker: broker,
        credentials: null,
      });
      return user;
    });
  },
  getAllUsers: async () => {
    const result = await db
      .select({
        userId: users.userId,
        name: users.name,
        username: users.username,
        email: users.email,
        strategy: users.strategy,
        createdAt: users.createdAt,
        role: users.role,
        broker: broker_credentials.broker,
      })
      .from(users)
      .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId));

    return result.length > 0 ? result : null;
  },

  getUser: async (userId: string) => {
    const [result] = await db
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

    return result ?? null;
  },

  updateUser: async (userId: string, updateData: object) => {
    await db.update(users).set(updateData).where(eq(users.userId, userId));
    return;
  },

  getBrokerCredentials: async (userId: string) => {
    const [result] = await db
      .select({
        broker: broker_credentials.broker,
        credentials: broker_credentials.credentials,
        updatedAt: broker_credentials.updatedAt,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId));

    return result ?? null;
  },

  updateBrokerCredentials: async (userId: string, credentials: string) => {
    await db
      .update(broker_credentials)
      .set({
        credentials: credentials,
        updatedAt: new Date(),
      })
      .where(eq(broker_credentials.userId, userId));
    return;
  },

  getETFUniverse: async () => {
    const result = await db.select().from(etf);
    return result.length > 0 ? result : null;
  },

  addETF: async (ticker: string, name: string, underlyingAsset: string | null) => {
    await db.insert(etf).values({
      ticker,
      name,
      underlyingAsset,
    });
    return;
  }
}
