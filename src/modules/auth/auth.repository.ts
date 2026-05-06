import { db } from '@/config/database.config.js';
import { users } from '@/database/schema/index.js';
import { eq } from 'drizzle-orm';

export const AuthRepository = {
  findUserWithPassword: async (username: string) => {
    const [user] = await db
      .select({
        userId: users.userId,
        username: users.username,
        password: users.password,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user ?? null;
  }
}
  
