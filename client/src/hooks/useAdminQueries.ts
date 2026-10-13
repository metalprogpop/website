import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi, type SubscriberListParams } from "../lib/adminApi";

export const adminKeys = {
  all: ["admin"] as const,
  subscribers: ["admin", "subscribers"] as const,
  subscriberList: (params: SubscriberListParams) =>
    ["admin", "subscribers", params] as const,
  history: (subscriberId: number) =>
    ["admin", "subscriptions", subscriberId] as const,
  histories: ["admin", "subscriptions"] as const,
  trash: ["admin", "trash"] as const,
};

export const useSubscriberList = (params: SubscriberListParams) =>
  useQuery({
    queryKey: adminKeys.subscriberList(params),
    queryFn: () => adminApi.listSubscribers(params),
    placeholderData: keepPreviousData,
  });

export const useSubscriptionHistory = (subscriberId: number) =>
  useQuery({
    queryKey: adminKeys.history(subscriberId),
    queryFn: () => adminApi.listSubscriptions(subscriberId),
  });
