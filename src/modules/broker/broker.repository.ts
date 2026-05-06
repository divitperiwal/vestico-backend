import { db } from '@/config/database.config.js';
import { broker_credentials } from '@/database/schema/broker_credentials.schema.js';
import { eq } from 'drizzle-orm';

export class BrokerDatabase {
  static async getCredentials(userId: string) : Promise<{ credentials: string | null} | null> {
    const [result] = await db
      .select({
        credentials: broker_credentials.credentials,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId))
      .limit(1);
    return result ?? null;
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
