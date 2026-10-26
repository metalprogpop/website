CREATE TABLE IF NOT EXISTS "fan_club_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"program" integer NOT NULL,
	"part" integer NOT NULL,
	"last_part" integer NOT NULL,
	"s3_key" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fan_club_videos_program_part_unique" ON "fan_club_videos" USING btree ("program","part");