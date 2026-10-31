CREATE TABLE IF NOT EXISTS "pone_rec_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"pone_rec_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pone_rec_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"pone_rec_id" integer NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"starts_at" text,
	"quote" text,
	"searchable" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pone_recs" (
	"id" serial PRIMARY KEY NOT NULL,
	"program" integer NOT NULL,
	"s3_key" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"duration_seconds" integer NOT NULL,
	"main_topic" text NOT NULL,
	"thumbnail_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pone_rec_tags" ADD CONSTRAINT "pone_rec_tags_pone_rec_id_pone_recs_id_fk" FOREIGN KEY ("pone_rec_id") REFERENCES "public"."pone_recs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pone_rec_topics" ADD CONSTRAINT "pone_rec_topics_pone_rec_id_pone_recs_id_fk" FOREIGN KEY ("pone_rec_id") REFERENCES "public"."pone_recs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pone_rec_tags_pone_rec_id_idx" ON "pone_rec_tags" USING btree ("pone_rec_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pone_rec_topics_pone_rec_id_idx" ON "pone_rec_topics" USING btree ("pone_rec_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pone_recs_program_unique" ON "pone_recs" USING btree ("program");