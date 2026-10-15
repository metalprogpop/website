import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { z } from "zod";
import type { StatusCounts, subscriberListQuerySchema } from "shared";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";

type ListQuery = z.output<typeof subscriberListQuerySchema>;

// One row per subscriber: their most recent live subscription (by start
// date, then id). Filters on status/platform apply to this subscription.
export const latestSubscription = db
  .selectDistinctOn([subscriptions.subscriberId], {
    subscriberId: subscriptions.subscriberId,
    subscriptionId: sql<number | null>`${subscriptions.id}`.as(
      "subscription_id",
    ),
    status: subscriptions.status,
    platform: subscriptions.platform,
    startedOn: subscriptions.startedOn,
  })
  .from(subscriptions)
  .where(isNull(subscriptions.deletedAt))
  .orderBy(
    subscriptions.subscriberId,
    sql`${subscriptions.startedOn} DESC NULLS LAST`,
    desc(subscriptions.id),
  )
  .as("latest");

const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, (char) => `\\${char}`);

const buildFilters = (query: ListQuery): SQL[] => {
  const filters: SQL[] = [isNull(subscribers.deletedAt)];
  if (query.q) {
    const pattern = `%${escapeLike(query.q)}%`;
    const search = or(
      ilike(subscribers.email, pattern),
      ilike(subscribers.firstName, pattern),
      ilike(subscribers.lastName, pattern),
      ilike(subscribers.fanName, pattern),
      sql`concat_ws(' ', ${subscribers.firstName}, ${subscribers.lastName}) ILIKE ${pattern}`,
    );
    if (search) {
      filters.push(search);
    }
  }
  if (query.status) {
    filters.push(eq(latestSubscription.status, query.status));
  }
  if (query.platform) {
    filters.push(eq(latestSubscription.platform, query.platform));
  }
  return filters;
};

export const listSubscribers = async (query: ListQuery) => {
  const where = and(...buildFilters(query));

  const pageRows = await db
    .select({
      id: subscribers.id,
      latestSubscriptionId: latestSubscription.subscriptionId,
    })
    .from(subscribers)
    .leftJoin(
      latestSubscription,
      eq(latestSubscription.subscriberId, subscribers.id),
    )
    .where(where)
    .orderBy(
      sql`${latestSubscription.startedOn} DESC NULLS LAST`,
      asc(subscribers.id),
    )
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize);

  const totalRows = await db
    .select({ total: count() })
    .from(subscribers)
    .leftJoin(
      latestSubscription,
      eq(latestSubscription.subscriberId, subscribers.id),
    )
    .where(where);

  const ids = pageRows.map((row) => row.id);
  const latestIds = pageRows
    .map((row) => row.latestSubscriptionId)
    .filter((id): id is number => id !== null);

  const people =
    ids.length > 0
      ? await db.select().from(subscribers).where(inArray(subscribers.id, ids))
      : [];
  const latest =
    latestIds.length > 0
      ? await db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.id, latestIds))
      : [];
  const historyCounts =
    ids.length > 0
      ? await db
          .select({
            subscriberId: subscriptions.subscriberId,
            total: count(),
          })
          .from(subscriptions)
          .where(
            and(
              inArray(subscriptions.subscriberId, ids),
              isNull(subscriptions.deletedAt),
            ),
          )
          .groupBy(subscriptions.subscriberId)
      : [];

  const personById = new Map(people.map((person) => [person.id, person]));
  const latestById = new Map(latest.map((entry) => [entry.id, entry]));
  const countBySubscriber = new Map(
    historyCounts.map((row) => [row.subscriberId, row.total]),
  );

  const items = pageRows.flatMap((row) => {
    const person = personById.get(row.id);
    if (!person) {
      return [];
    }
    return [
      {
        ...person,
        latestSubscription:
          row.latestSubscriptionId === null
            ? null
            : (latestById.get(row.latestSubscriptionId) ?? null),
        subscriptionCount: countBySubscriber.get(row.id) ?? 0,
      },
    ];
  });

  return {
    items,
    total: totalRows.at(0)?.total ?? 0,
    page: query.page,
    pageSize: query.pageSize,
    counts: await countByStatus(),
  };
};

// Counts over all live subscribers by the status of their latest
// subscription, independent of the current search and filters.
const countByStatus = async (): Promise<StatusCounts> => {
  const rows = await db
    .select({ status: latestSubscription.status, total: count() })
    .from(subscribers)
    .innerJoin(
      latestSubscription,
      eq(latestSubscription.subscriberId, subscribers.id),
    )
    .where(isNull(subscribers.deletedAt))
    .groupBy(latestSubscription.status);

  const counts: StatusCounts = { active: 0, paused: 0, cancelled: 0 };
  for (const row of rows) {
    counts[row.status] = row.total;
  }
  return counts;
};

export const listSubscriptionsFor = (subscriberId: number) =>
  db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.subscriberId, subscriberId),
        isNull(subscriptions.deletedAt),
      ),
    )
    .orderBy(
      sql`${subscriptions.startedOn} DESC NULLS LAST`,
      desc(subscriptions.id),
    );
