import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { roleEnum, strategyEnum } from './enums.schema.js';

export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username : text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('user'),
  strategy: strategyEnum('strategy').notNull().default('MOMETF0812FR'),
});
