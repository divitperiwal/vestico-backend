import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";

export const sessions = pgTable("sessions", {
    id: integer("id").primaryKey().notNull().generatedByDefaultAsIdentity(),
    userId: uuid("user_id").notNull().references(() => users.userId, {
        onUpdate: "cascade",
        onDelete: "cascade",
    }),
    sessionId : text("session_id").unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
