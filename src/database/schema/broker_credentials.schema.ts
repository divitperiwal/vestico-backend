import { pgTable, uuid, timestamp, integer, text } from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";
import {brokerEnum} from "./enums.schema.js";

export const broker_credentials = pgTable("broker_credentials", {
    id: integer("id").primaryKey().notNull().generatedByDefaultAsIdentity(),
    userId: uuid("user_id").notNull().references(() => users.userId, {
        onUpdate: "cascade",
        onDelete: "cascade",
    }),
    broker: brokerEnum("broker").notNull().default("mstock"),
    credentials: text("credentials"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    
});