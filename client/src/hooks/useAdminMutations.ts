import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Subscription,
  SubscriberListResponse,
  SubscriberUpdate,
  SubscriptionCreate,
  SubscriptionUpdate,
} from "shared";
import { adminApi } from "../lib/adminApi";
import { adminKeys } from "./useAdminQueries";

type Snapshot = [QueryKey, unknown][];

const showError = (error: Error) => {
  toast.error(error.message);
};

const restore = (queryClient: QueryClient, snapshot: Snapshot | undefined) => {
  for (const [key, data] of snapshot ?? []) {
    queryClient.setQueryData(key, data);
  }
};

const takeSnapshot = async (
  queryClient: QueryClient,
  keys: readonly QueryKey[],
): Promise<Snapshot> => {
  await Promise.all(
    keys.map((queryKey) => queryClient.cancelQueries({ queryKey })),
  );
  return keys.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }));
};

// Cell edits: apply the change to the cached grid immediately, roll back and
// show the server's message if the save fails.
export const useUpdateSubscriber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubscriberUpdate }) =>
      adminApi.updateSubscriber(id, data),
    onMutate: async ({ id, data }) => {
      const snapshot = await takeSnapshot(queryClient, [adminKeys.subscribers]);
      queryClient.setQueriesData<SubscriberListResponse>(
        { queryKey: adminKeys.subscribers },
        (old) =>
          old && {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, ...data } : item,
            ),
          },
      );
      return snapshot;
    },
    onError: (error, _vars, snapshot) => {
      restore(queryClient, snapshot);
      showError(error);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: adminKeys.subscribers }),
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubscriptionUpdate }) =>
      adminApi.updateSubscription(id, data),
    onMutate: async ({ id, data }) => {
      const snapshot = await takeSnapshot(queryClient, [
        adminKeys.subscribers,
        adminKeys.histories,
      ]);
      const apply = (entry: Subscription): Subscription =>
        entry.id === id ? { ...entry, ...data } : entry;
      queryClient.setQueriesData<SubscriberListResponse>(
        { queryKey: adminKeys.subscribers },
        (old) =>
          old && {
            ...old,
            items: old.items.map((item) =>
              item.latestSubscription
                ? {
                    ...item,
                    latestSubscription: apply(item.latestSubscription),
                  }
                : item,
            ),
          },
      );
      queryClient.setQueriesData<Subscription[]>(
        { queryKey: adminKeys.histories },
        (old) => old?.map(apply),
      );
      return snapshot;
    },
    onError: (error, _vars, snapshot) => {
      restore(queryClient, snapshot);
      showError(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
};

// Structural changes (create, delete, restore) refresh every admin view.
const useAdminAction = <TVars>(
  action: (vars: TVars) => Promise<unknown>,
  successMessage: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(successMessage);
    },
    onError: showError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
};

export const useDeleteSubscriber = () =>
  useAdminAction(adminApi.deleteSubscriber, "Suscriptor enviado a la papelera");

export const useRestoreSubscriber = () =>
  useAdminAction(adminApi.restoreSubscriber, "Suscriptor restaurado");

export const useCreateSubscription = () =>
  useAdminAction(
    ({
      subscriberId,
      data,
    }: {
      subscriberId: number;
      data: SubscriptionCreate;
    }) => adminApi.createSubscription(subscriberId, data),
    "Suscripción agregada",
  );

export const useDeleteSubscription = () =>
  useAdminAction(
    adminApi.deleteSubscription,
    "Suscripción enviada a la papelera",
  );

export const useRestoreSubscription = () =>
  useAdminAction(adminApi.restoreSubscription, "Suscripción restaurada");

export const useCreateSubscriber = () =>
  useAdminAction(adminApi.createSubscriber, "Suscriptor creado");
