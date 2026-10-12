DO $$ BEGIN
 CREATE TYPE "public"."subscription_platform" AS ENUM('mercadopago', 'patreon');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"fan_name" text,
	"in_hall_of_fame" boolean DEFAULT false NOT NULL,
	"fan_spotlight" boolean DEFAULT false NOT NULL,
	"contacted" boolean DEFAULT false NOT NULL,
	"replied" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"platform" "subscription_platform",
	"amount" numeric(12, 2),
	"currency" text,
	"status" "subscription_status" NOT NULL,
	"started_on" date,
	"ended_on" date,
	"plan_original" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_email_live_unique" ON "subscribers" USING btree ("email") WHERE "subscribers"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_subscriber_id_idx" ON "subscriptions" USING btree ("subscriber_id");