import { z } from "zod";

export const platformSchema = z.enum(["mercadopago", "patreon"]);
export type Platform = z.infer<typeof platformSchema>;

export const subscriptionStatusSchema = z.enum([
  "active",
  "paused",
  "cancelled",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

// Empty strings coming from inline edits mean "clear this field".
const optionalTextSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value === "" ? null : value))
  .nullable();

// --- Records as returned by the API (timestamps serialized as ISO strings) ---

export const subscriptionSchema = z.object({
  id: z.number(),
  subscriberId: z.number(),
  platform: platformSchema.nullable(),
  amount: z.string().nullable(),
  currency: z.string().nullable(),
  status: subscriptionStatusSchema,
  startedOn: z.string().nullable(),
  endedOn: z.string().nullable(),
  planOriginal: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const subscriptionListSchema = z.array(subscriptionSchema);

export const apiErrorSchema = z.object({ error: z.string() });

export const subscriberSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fanName: z.string().nullable(),
  hiddenFromHallOfFans: z.boolean(),
  fanSpotlight: z.boolean(),
  contacted: z.boolean(),
  replied: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
export type Subscriber = z.infer<typeof subscriberSchema>;

export const subscriberRowSchema = subscriberSchema.extend({
  latestSubscription: subscriptionSchema.nullable(),
  subscriptionCount: z.number(),
});
export type SubscriberRow = z.infer<typeof subscriberRowSchema>;

export const statusCountsSchema = z.object({
  active: z.number(),
  paused: z.number(),
  cancelled: z.number(),
});
export type StatusCounts = z.infer<typeof statusCountsSchema>;

export const subscriberListResponseSchema = z.object({
  items: z.array(subscriberRowSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  counts: statusCountsSchema,
});
export type SubscriberListResponse = z.infer<
  typeof subscriberListResponseSchema
>;

// --- Requests ---

export const subscriberListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: subscriptionStatusSchema.optional(),
  platform: platformSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type SubscriberListQuery = z.input<typeof subscriberListQuerySchema>;

// Staff edits only what the payment platforms do not provide: names, notes
// and whether someone is left out of the Hall of Fans. Unknown keys are
// rejected, not silently dropped.
export const subscriberUpdateSchema = z
  .object({
    firstName: optionalTextSchema,
    lastName: optionalTextSchema,
    fanName: optionalTextSchema,
    notes: optionalTextSchema,
    hiddenFromHallOfFans: z.boolean(),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Nada para actualizar");
export type SubscriberUpdate = z.input<typeof subscriberUpdateSchema>;

export const subscriptionUpdateSchema = z
  .object({ notes: optionalTextSchema })
  .strict();
export type SubscriptionUpdate = z.input<typeof subscriptionUpdateSchema>;
