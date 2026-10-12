import { Router, type Response } from "express";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import {
  subscriberCreateSchema,
  subscriberListQuerySchema,
  subscriberUpdateSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from "shared";
import { db } from "../db/index.js";
import { subscribers, subscriptions } from "../db/schema.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireStaff } from "../middleware/requireStaff.js";
import {
  listSubscribers,
  listSubscriptionsFor,
  listTrash,
} from "../services/subscribers.js";

// Staff-only subscriber admin. Nothing is ever hard-deleted: DELETE sets
// deleted_at and /restore clears it.
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

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === "object" && err !== null && "code" in err
    ? err.code === "23505"
    : false;

const EMAIL_TAKEN = "Ya hay un suscriptor con ese email";

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

adminRouter.post(
  "/subscribers",
  asyncHandler(async (req, res) => {
    const body = subscriberCreateSchema.safeParse(req.body);
    if (!body.success) {
      badRequest(res, body.error);
      return;
    }
    try {
      const created = await db
        .insert(subscribers)
        .values(body.data)
        .returning();
      res.status(201).json(created.at(0));
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: EMAIL_TAKEN });
        return;
      }
      throw err;
    }
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
    try {
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
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: EMAIL_TAKEN });
        return;
      }
      throw err;
    }
  }),
);

adminRouter.delete(
  "/subscribers/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      notFound(res);
      return;
    }
    const deleted = await db
      .update(subscribers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(subscribers.id, id.data), isNull(subscribers.deletedAt)))
      .returning({ id: subscribers.id });
    if (deleted.length === 0) {
      notFound(res);
      return;
    }
    res.status(204).end();
  }),
);

adminRouter.post(
  "/subscribers/:id/restore",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      notFound(res);
      return;
    }
    try {
      const restored = await db
        .update(subscribers)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(eq(subscribers.id, id.data), isNotNull(subscribers.deletedAt)),
        )
        .returning();
      const row = restored.at(0);
      if (!row) {
        notFound(res);
        return;
      }
      res.json(row);
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(409).json({
          error: "No se puede restaurar: ya hay otro suscriptor con ese email",
        });
        return;
      }
      throw err;
    }
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

adminRouter.post(
  "/subscribers/:id/subscriptions",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success || !(await findLiveSubscriber(id.data))) {
      notFound(res);
      return;
    }
    const body = subscriptionCreateSchema.safeParse(req.body);
    if (!body.success) {
      badRequest(res, body.error);
      return;
    }
    const created = await db
      .insert(subscriptions)
      .values({ ...body.data, subscriberId: id.data })
      .returning();
    res.status(201).json(created.at(0));
  }),
);

// Subscriptions can only be changed (or restored) while their subscriber is
// live; a deleted subscriber's history comes back with the subscriber.
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

adminRouter.delete(
  "/subscriptions/:id",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      notFound(res);
      return;
    }
    const deleted = await db
      .update(subscriptions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(liveSubscriptionOf(id.data))
      .returning({ id: subscriptions.id });
    if (deleted.length === 0) {
      notFound(res);
      return;
    }
    res.status(204).end();
  }),
);

adminRouter.post(
  "/subscriptions/:id/restore",
  asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      notFound(res);
      return;
    }
    const restored = await db
      .update(subscriptions)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(subscriptions.id, id.data),
          isNotNull(subscriptions.deletedAt),
          parentIsLive,
        ),
      )
      .returning();
    const row = restored.at(0);
    if (!row) {
      notFound(res);
      return;
    }
    res.json(row);
  }),
);

// --- Trash ---

adminRouter.get(
  "/trash",
  asyncHandler(async (_req, res) => {
    res.json(await listTrash());
  }),
);
