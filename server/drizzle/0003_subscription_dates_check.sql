-- Custom SQL migration file, put you code below! --
-- drizzle-kit 0.22 cannot generate CHECK constraints.
-- A subscription cannot end before it starts (either date may be unknown).
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_dates_in_order" CHECK ("ended_on" IS NULL OR "started_on" IS NULL OR "ended_on" >= "started_on");
