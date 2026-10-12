import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["fan", "staff"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRole("role").notNull().default("fan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const magicTokens = pgTable("magic_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlatform = pgEnum("subscription_platform", [
  "mercadopago",
  "patreon",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "paused",
  "cancelled",
]);

// Data rows are never hard-deleted: deleted_at marks them as removed so they
// can be reviewed or restored later. Queries must filter deleted_at IS NULL.
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    fanName: text("fan_name"),
    inHallOfFame: boolean("in_hall_of_fame").notNull().default(false),
    fanSpotlight: boolean("fan_spotlight").notNull().default(false),
    contacted: boolean("contacted").notNull().default(false),
    replied: boolean("replied").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    // Unique among live rows only, so a deleted subscriber can be re-created.
    emailLiveUnique: uniqueIndex("subscribers_email_live_unique")
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    subscriberId: integer("subscriber_id")
      .notNull()
      .references(() => subscribers.id, { onDelete: "restrict" }),
    platform: subscriptionPlatform("platform"),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    currency: text("currency"),
    status: subscriptionStatus("status").notNull(),
    startedOn: date("started_on"),
    endedOn: date("ended_on"),
    planOriginal: text("plan_original"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    subscriberIdx: index("subscriptions_subscriber_id_idx").on(
      table.subscriberId,
    ),
  }),
);
