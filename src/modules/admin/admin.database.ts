import { db } from '@/config/drizzle.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { etf } from '@/database/schema/etf.schema.js';
import { sessions } from '@/database/schema/session.schema.js';
import { users } from '@/database/schema/user.schema.js';
import { ApiError } from '@/utils/constants/ApiError.js';
import { eq } from 'drizzle-orm';

export class AdminDatabase {
  static async getAllUsers() {
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
      .leftJoin(broker_credentials, eq(users.userId, broker_credentials.userId));
    if (result.length === 0) throw new ApiError('No users found', 404);
    return result;
  }

  static async getUser(userId: string) {
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
    if (!result) throw new ApiError('User not found', 404);
    console.log(result);
    return result;
  }

  static async updateUser(userId: string, updateData: object) {
    await db.update(users).set(updateData).where(eq(users.userId, userId));
  }

  static async getBrokerCredentials(userId: string) {
    const [result] = await db
      .select({
        broker: broker_credentials.broker,
        credentials: broker_credentials.credentials,
        updatedAt: broker_credentials.updatedAt,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId));

    if (!result) throw new ApiError('Broker credentials not found', 404);

    return result;
  }

  static async updateBrokerCredentials(userId: string, credentials: string) {
    await db
      .update(broker_credentials)
      .set({
        credentials: credentials,
        updatedAt: new Date(),
      })
      .where(eq(broker_credentials.userId, userId));

    return;
  }

  static async revokeUserSession(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId));

    return;
  }

  static async getETFUniverse() {
    const result = await db.select().from(etf);
    if (result.length === 0) throw new ApiError('No ETFs found', 404);
    return result;
  }

  static async addETF(ticker: string, name: string, underlyingAsset: string | null) {
    await db.insert(etf).values({
      ticker,
      name,
      underlyingAsset,
    });
    return;
  }
}
