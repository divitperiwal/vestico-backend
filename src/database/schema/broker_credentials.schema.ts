import { pgTable, uuid, timestamp, integer, text, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';
import { brokerEnum } from './enums.schema.js';

export const broker_credentials = pgTable('broker_credentials', {
  id: integer('id').primaryKey().notNull().generatedByDefaultAsIdentity(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.userId, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  broker: brokerEnum('broker'),
  credentials: text('credentials'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
