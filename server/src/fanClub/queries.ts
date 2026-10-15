import { and, asc, eq, isNull, min, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";
import { hallOfFansName } from "./hallOfFans.js";

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
