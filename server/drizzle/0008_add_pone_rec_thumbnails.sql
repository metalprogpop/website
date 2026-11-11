CREATE TABLE IF NOT EXISTS "pone_rec_thumbnails" (
	"id" serial PRIMARY KEY NOT NULL,
	"pone_rec_id" integer NOT NULL,
	"s3_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pone_rec_thumbnails" ADD CONSTRAINT "pone_rec_thumbnails_pone_rec_id_pone_recs_id_fk" FOREIGN KEY ("pone_rec_id") REFERENCES "public"."pone_recs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pone_rec_thumbnails_key_live_unique" ON "pone_rec_thumbnails" USING btree ("pone_rec_id","s3_key") WHERE "pone_rec_thumbnails"."deleted_at" IS NULL;--> statement-breakpoint
-- Every image already chosen becomes one of its episode's options.
INSERT INTO "pone_rec_thumbnails" ("pone_rec_id", "s3_key")
SELECT "id", "thumbnail_key" FROM "pone_recs" WHERE "thumbnail_key" IS NOT NULL;
