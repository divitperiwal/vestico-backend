import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const etf = pgTable('etf', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull().unique(),
  ticker: text('ticker').notNull().unique(),
  underlyingAsset: text('underlying_asset'),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
});
