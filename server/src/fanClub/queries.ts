import { and, asc, eq, isNull, min, sql } from "drizzle-orm";
import type { SubscriptionStatus } from "shared";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";
import { latestSubscription } from "../services/subscribers.js";
import { hallOfFansName } from "./hallOfFans.js";

// Users and subscribers are not linked; they meet by email.
const sameEmail = (email: string) =>
  sql`lower(${subscribers.email}) = ${email.toLowerCase()}`;

// Status of the latest live subscription of the live subscriber with this
// email, or null when there is none.
export const latestStatusForEmail = async (
  email: string,
): Promise<SubscriptionStatus | null> => {
  const rows = await db
    .select({ status: latestSubscription.status })
    .from(subscribers)
    .innerJoin(
      latestSubscription,
      eq(latestSubscription.subscriberId, subscribers.id),
    )
    .where(and(sameEmail(email), isNull(subscribers.deletedAt)))
    .limit(1);
  return rows.at(0)?.status ?? null;
};

// Everyone who ever had a live subscription and was not hidden by staff,
// oldest first subscription first.
export const listHallOfFans = async (): Promise<string[]> => {
  const firstStarted = min(subscriptions.startedOn);
  const rows = await db
    .select({
      fanName: subscribers.fanName,
      firstName: subscribers.firstName,
      lastName: subscribers.lastName,
    })
    .from(subscribers)
    .innerJoin(subscriptions, eq(subscriptions.subscriberId, subscribers.id))
    .where(
      and(
        isNull(subscribers.deletedAt),
        isNull(subscriptions.deletedAt),
        eq(subscribers.hiddenFromHallOfFans, false),
      ),
    )
    .groupBy(subscribers.id)
    .orderBy(sql`${firstStarted} ASC NULLS LAST`, asc(subscribers.id));
  return rows.map(hallOfFansName).filter((name) => name !== null);
};
