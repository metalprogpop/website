import { z } from "zod";

export const platformSchema = z.enum(["mercadopago", "patreon"]);
export type Platform = z.infer<typeof platformSchema>;

export const subscriptionStatusSchema = z.enum([
  "active",
  "paused",
  "cancelled",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

const isRealDate = (value: string): boolean => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá el formato AAAA-MM-DD")
  .refine(isRealDate, "Esa fecha no existe");

const datesInOrder = (value: {
  startedOn?: string | null;
  endedOn?: string | null;
}): boolean =>
  !value.startedOn || !value.endedOn || value.endedOn >= value.startedOn;

const DATES_OUT_OF_ORDER = "La baja no puede ser anterior al alta";

// Empty strings coming from inline edits mean "clear this field".
const optionalTextSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value === "" ? null : value))
  .nullable();

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, "Monto inválido");

const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Usá un código de moneda de 3 letras");

const emailSchema = z.string().trim().toLowerCase().email("Email inválido");

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
  inHallOfFame: z.boolean(),
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

export const trashResponseSchema = z.object({
  subscribers: z.array(subscriberSchema),
  subscriptions: z.array(
    subscriptionSchema.extend({ subscriberEmail: z.string() }),
  ),
});
export type TrashResponse = z.infer<typeof trashResponseSchema>;

// --- Requests ---

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const subscriberListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: subscriptionStatusSchema.optional(),
  platform: platformSchema.optional(),
  hallOfFame: booleanQuerySchema.optional(),
  spotlight: booleanQuerySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type SubscriberListQuery = z.input<typeof subscriberListQuerySchema>;

export const subscriberCreateSchema = z.object({
  email: emailSchema,
  firstName: optionalTextSchema.optional(),
  lastName: optionalTextSchema.optional(),
  fanName: optionalTextSchema.optional(),
});
export type SubscriberCreate = z.input<typeof subscriberCreateSchema>;

export const subscriberUpdateSchema = z
  .object({
    email: emailSchema,
    firstName: optionalTextSchema,
    lastName: optionalTextSchema,
    fanName: optionalTextSchema,
    inHallOfFame: z.boolean(),
    fanSpotlight: z.boolean(),
    contacted: z.boolean(),
    replied: z.boolean(),
    notes: optionalTextSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Nada para actualizar");
export type SubscriberUpdate = z.input<typeof subscriberUpdateSchema>;

const subscriptionFieldsSchema = z.object({
  platform: platformSchema.nullable(),
  amount: amountSchema.nullable(),
  currency: currencySchema.nullable(),
  status: subscriptionStatusSchema,
  startedOn: isoDateSchema.nullable(),
  endedOn: isoDateSchema.nullable(),
  notes: optionalTextSchema,
});

export const subscriptionCreateSchema = subscriptionFieldsSchema
  .partial()
  .extend({ status: subscriptionStatusSchema.default("active") })
  .refine(datesInOrder, DATES_OUT_OF_ORDER);
export type SubscriptionCreate = z.input<typeof subscriptionCreateSchema>;

// A patch with only one date is checked against the stored one by a
// database constraint.
export const subscriptionUpdateSchema = subscriptionFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Nada para actualizar")
  .refine(datesInOrder, DATES_OUT_OF_ORDER);
export type SubscriptionUpdate = z.input<typeof subscriptionUpdateSchema>;
