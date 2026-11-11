import { sql } from "drizzle-orm";
import {
  bigint,
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
    // Everyone who ever subscribed is listed in the public Hall of Fans;
    // staff set this when someone asks to be left out.
    hiddenFromHallOfFans: boolean("hidden_from_hall_of_fans")
      .notNull()
      .default(false),
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

export const episodeGenre = pgEnum("episode_genre", ["metal", "prog", "pop"]);

// Episodes mirrored from the Audioboom RSS feed, so the site keeps working
// (and old episodes stay put) when the feed is slow, down or edited. The
// number is the episode's identity on the site. deleted_at hides episodes
// that left the feed; they are never hard-deleted.
export const episodes = pgTable(
  "episodes",
  {
    id: serial("id").primaryKey(),
    number: integer("number").notNull(),
    guid: text("guid").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    album: text("album").notNull(),
    band: text("band"),
    genre: episodeGenre("genre"),
    descriptionHtml: text("description_html").notNull(),
    descriptionText: text("description_text").notNull(),
    audioUrl: text("audio_url").notNull(),
    artworkUrl: text("artwork_url").notNull(),
    audioboomUrl: text("audioboom_url").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    publishedAt: timestamp("published_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    numberUnique: uniqueIndex("episodes_number_unique").on(table.number),
  }),
);

// Fan Club program videos, mirrored from the media bucket by a staff-run
// sync (videos don't change once uploaded). One row per file: part k of
// program N is episode 3 × (N − 1) + k, and program 1 is a single file that
// covers parts 1 to 3 (last_part 3). A part with no row was lost. The S3 key
// never leaves the server: members get presigned URLs, nothing else.
export const fanClubVideos = pgTable(
  "fan_club_videos",
  {
    id: serial("id").primaryKey(),
    program: integer("program").notNull(),
    part: integer("part").notNull(),
    lastPart: integer("last_part").notNull(),
    s3Key: text("s3_key").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    programPartUnique: uniqueIndex("fan_club_videos_program_part_unique").on(
      table.program,
      table.part,
    ),
  }),
);

// Poné Rec™, the Fan Club's bonus podcast: one episode per program, mirrored
// from the media bucket and loaded with the content staff approved (main
// topic, thumbnail, topics and tags). Only the main topic shows on its card;
// topics and tags are for search, and a topic that isn't searchable is kept
// but never served. The S3 keys never leave the server.
export const poneRecs = pgTable(
  "pone_recs",
  {
    id: serial("id").primaryKey(),
    program: integer("program").notNull(),
    s3Key: text("s3_key").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    mainTopic: text("main_topic").notNull(),
    thumbnailKey: text("thumbnail_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    programUnique: uniqueIndex("pone_recs_program_unique").on(table.program),
  }),
);

export const poneRecTopics = pgTable(
  "pone_rec_topics",
  {
    id: serial("id").primaryKey(),
    poneRecId: integer("pone_rec_id")
      .notNull()
      .references(() => poneRecs.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    // "07:06": where it starts in the episode.
    startsAt: text("starts_at"),
    quote: text("quote"),
    searchable: boolean("searchable").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    poneRecIdx: index("pone_rec_topics_pone_rec_id_idx").on(table.poneRecId),
  }),
);

export const poneRecTags = pgTable(
  "pone_rec_tags",
  {
    id: serial("id").primaryKey(),
    poneRecId: integer("pone_rec_id")
      .notNull()
      .references(() => poneRecs.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    poneRecIdx: index("pone_rec_tags_pone_rec_id_idx").on(table.poneRecId),
  }),
);

// The images a Poné Rec™ episode can show: the pipeline's candidates and any
// image chosen before. `pone_recs.thumbnail_key` is the chosen one (null
// means the default image), always one of these live keys.
export const poneRecThumbnails = pgTable(
  "pone_rec_thumbnails",
  {
    id: serial("id").primaryKey(),
    poneRecId: integer("pone_rec_id")
      .notNull()
      .references(() => poneRecs.id, { onDelete: "restrict" }),
    s3Key: text("s3_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    keyLiveUnique: uniqueIndex("pone_rec_thumbnails_key_live_unique")
      .on(table.poneRecId, table.s3Key)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);
