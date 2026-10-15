ALTER TABLE "subscribers" ADD COLUMN "hidden_from_hall_of_fans" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN IF EXISTS "in_hall_of_fame";