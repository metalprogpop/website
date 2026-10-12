import {
  apiErrorSchema,
  subscriberListResponseSchema,
  subscriberSchema,
  subscriptionListSchema,
  subscriptionSchema,
  trashResponseSchema,
  type Platform,
  type SubscriberCreate,
  type SubscriberUpdate,
  type SubscriptionCreate,
  type SubscriptionStatus,
  type SubscriptionUpdate,
} from "shared";
import { API_URL } from "./api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async (
  path: string,
  init: RequestInit = {},
): Promise<unknown> => {
  const res = await fetch(`${API_URL}/api/v1/admin${path}`, {
    ...init,
    credentials: "include",
    headers:
      init.body === undefined
        ? init.headers
        : { "Content-Type": "application/json", ...init.headers },
  });
  if (res.status === 204) {
    return null;
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(body);
    throw new ApiError(
      res.status,
      parsed.success ? parsed.data.error : "Algo salió mal. Probá de nuevo.",
    );
  }
  return body;
};

const json = (method: string, data: unknown): RequestInit => ({
  method,
  body: JSON.stringify(data),
});

export type SubscriberListParams = {
  q?: string;
  status?: SubscriptionStatus;
  platform?: Platform;
  hallOfFame?: boolean;
  spotlight?: boolean;
  page: number;
  pageSize: number;
};

const toSearchParams = (query: SubscriberListParams): string => {
  const params = new URLSearchParams();
  const entries: [string, string | number | boolean | undefined][] =
    Object.entries(query);
  for (const [key, value] of entries) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  return params.toString();
};

export const adminApi = {
  listSubscribers: async (query: SubscriberListParams) =>
    subscriberListResponseSchema.parse(
      await request(`/subscribers?${toSearchParams(query)}`),
    ),
  createSubscriber: async (data: SubscriberCreate) =>
    subscriberSchema.parse(await request("/subscribers", json("POST", data))),
  updateSubscriber: async (id: number, data: SubscriberUpdate) =>
    subscriberSchema.parse(
      await request(`/subscribers/${id}`, json("PATCH", data)),
    ),
  deleteSubscriber: async (id: number) => {
    await request(`/subscribers/${id}`, { method: "DELETE" });
  },
  restoreSubscriber: async (id: number) =>
    subscriberSchema.parse(
      await request(`/subscribers/${id}/restore`, { method: "POST" }),
    ),
  listSubscriptions: async (subscriberId: number) =>
    subscriptionListSchema.parse(
      await request(`/subscribers/${subscriberId}/subscriptions`),
    ),
  createSubscription: async (subscriberId: number, data: SubscriptionCreate) =>
    subscriptionSchema.parse(
      await request(
        `/subscribers/${subscriberId}/subscriptions`,
        json("POST", data),
      ),
    ),
  updateSubscription: async (id: number, data: SubscriptionUpdate) =>
    subscriptionSchema.parse(
      await request(`/subscriptions/${id}`, json("PATCH", data)),
    ),
  deleteSubscription: async (id: number) => {
    await request(`/subscriptions/${id}`, { method: "DELETE" });
  },
  restoreSubscription: async (id: number) =>
    subscriptionSchema.parse(
      await request(`/subscriptions/${id}/restore`, { method: "POST" }),
    ),
  trash: async () => trashResponseSchema.parse(await request("/trash")),
};
