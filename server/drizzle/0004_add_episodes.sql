DO $$ BEGIN
 CREATE TYPE "public"."episode_genre" AS ENUM('metal', 'prog', 'pop');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"guid" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"album" text NOT NULL,
	"band" text,
	"genre" "episode_genre",
	"description_html" text NOT NULL,
	"description_text" text NOT NULL,
	"audio_url" text NOT NULL,
	"artwork_url" text NOT NULL,
	"audioboom_url" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "episodes_number_unique" ON "episodes" USING btree ("number");