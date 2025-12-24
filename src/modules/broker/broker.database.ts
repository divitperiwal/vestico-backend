import { db } from '@/config/drizzle.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { eq } from 'drizzle-orm';
import { ApiError } from '@/utils/constants/ApiError.js';

export class BrokerDatabase {
  static async getCredentials(userId: string) {
    const [result] = await db
      .select({
        credentials: broker_credentials.credentials,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId))
      .limit(1);
    if (!result) return null;
    return result;
  }

  static async storeCredentials(userId: string, credentials: string) {
    await db
      .update(broker_credentials)
      .set({
        credentials: credentials,
        updatedAt: new Date(),
      })
      .where(eq(broker_credentials.userId, userId));
    return;
  }

}
