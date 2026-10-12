DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('fan', 'staff');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'fan' NOT NULL;