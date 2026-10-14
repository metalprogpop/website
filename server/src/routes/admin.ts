import { Router, type Response } from "express";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import {
  subscriberListQuerySchema,
  subscriberUpdateSchema,
  subscriptionUpdateSchema,
} from "shared";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";
import { syncEpisodes } from "../episodes/catalog.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireStaff } from "../middleware/requireStaff.js";
import {
  listSubscribers,
  listSubscriptionsFor,
} from "../services/subscribers.js";

// Staff-only admin. Subscribers, subscriptions and their status come from
// the payment platforms (today, the spreadsheet import), so staff can only
// read them and edit names and notes; nothing is created or deleted here.
// Staff can also force a full episode re-sync from the feed.
export const adminRouter = Router();
adminRouter.use(requireStaff);

const idSchema = z.coerce.number().int().positive();

const badRequest = (res: Response, error: z.ZodError): void => {
  res.status(400).json({
    error: error.issues.at(0)?.message ?? "Datos inválidos",
  });
};

const notFound = (res: Response): void => {
  res.status(404).json({ error: "Not found" });
};

const findLiveSubscriber = async (id: number) =>
  (
    await db
      .select({ id: subscribers.id })
      .from(subscribers)
      .where(and(eq(subscribers.id, id), isNull(subscribers.deletedAt)))
      .limit(1)
  ).at(0);

// --- Subscribers ---

adminRouter.get(
  "/subscribers",
  asyncHandler(async (req, res) => {
    const query = subscriberListQuerySchema.safeParse(req.query);
    if (!query.success) {
      badRequest(res, query.error);
      return;
    }
    res.json(await listSubscribers(query.data));
  }),
);

adminRouter.patch(
  "/subscribers/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    const body = subscriberUpdateSchema.safeParse(req.body);
    if (!id.success) {
      notFound(res);
      return;
    }
    if (!body.success) {
      badRequest(res, body.error);
      return;
    }
    const updated = await db
      .update(subscribers)
      .set({ ...body.data, updatedAt: new Date() })
      .where(and(eq(subscribers.id, id.data), isNull(subscribers.deletedAt)))
      .returning();
    const row = updated.at(0);
    if (!row) {
      notFound(res);
      return;
    }
    res.json(row);
  }),
);

// --- Subscriptions ---

adminRouter.get(
  "/subscribers/:id/subscriptions",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success || !(await findLiveSubscriber(id.data))) {
      notFound(res);
      return;
    }
    res.json(await listSubscriptionsFor(id.data));
  }),
);

// A subscription can only be changed while its subscriber is live.
const parentIsLive = sql`exists (select 1 from ${subscribers} where ${subscribers.id} = ${subscriptions.subscriberId} and ${subscribers.deletedAt} is null)`;

const liveSubscriptionOf = (id: number) =>
  and(eq(subscriptions.id, id), isNull(subscriptions.deletedAt), parentIsLive);

adminRouter.patch(
  "/subscriptions/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    const body = subscriptionUpdateSchema.safeParse(req.body);
    if (!id.success) {
      notFound(res);
      return;
    }
    if (!body.success) {
      badRequest(res, body.error);
      return;
    }
    const updated = await db
      .update(subscriptions)
      .set({ ...body.data, updatedAt: new Date() })
      .where(liveSubscriptionOf(id.data))
      .returning();
    const row = updated.at(0);
    if (!row) {
      notFound(res);
      return;
    }
    res.json(row);
  }),
);

// --- Episodes ---

// Re-reads the whole feed: fixes episodes uploaded with mistakes and hides
// the ones that left it. The hourly sync only looks at the newest few.
adminRouter.post(
  "/episodes/resync",
  asyncHandler(async (_req, res) => {
    try {
      res.json(await syncEpisodes("full"));
    } catch (err) {
      console.error("Episode re-sync failed:", err);
      res.status(502).json({
        error: "No se pudo leer el feed de Audioboom. Probá de nuevo.",
      });
    }
  }),
);
