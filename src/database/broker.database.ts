import { db } from '@/config/drizzle.config.js';
import { broker_credentials } from './schema/broker_credentials.schema.js';
import { eq } from 'drizzle-orm';
import { ApiError } from '@/utils/ApiError.js';

export const getBrokerCredentials = async (userId: string) => {
  try {
    const result = await db
      .select({
        credentials: broker_credentials.credentials,
      })
      .from(broker_credentials)
      .where(eq(broker_credentials.userId, userId))
      .limit(1);

    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    throw new ApiError('Unable to fetch broker access token', 500);
  }
};

export const storeBrokerCredentials = async (userId: string, credentials: string) => {
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
    throw new ApiError('Unable to store broker credentials', 500);
  }
};
