import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AdminPoneRec,
  AdminPoneRecList,
  AdminPoneRecUpdate,
} from "shared";
import { adminApi } from "../lib/adminApi";

const key = ["admin", "pone-rec"] as const;

export const useAdminPoneRecs = () =>
  useQuery({ queryKey: key, queryFn: adminApi.listPoneRecs });

const replaceEpisode = (
  list: AdminPoneRecList | undefined,
  program: number,
  change: Partial<AdminPoneRec>,
) =>
  list && {
    ...list,
    episodes: list.episodes.map((episode) =>
      episode.program === program ? { ...episode, ...change } : episode,
    ),
  };

// Edits to one episode. Each change is computed from the episode as it is
// on screen right then (earlier unsaved edits included), shown at once, and
// saved one after the other, in order. A failed save undoes just its own
// change and says why; the screen then settles on what the server has.
export const useUpdatePoneRec = (program: number) => {
  const queryClient = useQueryClient();
  const mutationKey = [...key, program];
  const mutation = useMutation({
    mutationKey,
    scope: { id: `pone-rec-${String(program)}` },
    mutationFn: ({ data }: { data: AdminPoneRecUpdate; before: object }) =>
      adminApi.updatePoneRec(program, data),
    onError: (error, { before }) => {
      queryClient.setQueryData<AdminPoneRecList>(key, (old) =>
        replaceEpisode(old, program, before),
      );
      toast.error(error.message);
    },
    onSettled: async () => {
      // Only once the last queued edit is done, so a reply never shows an
      // older state over a newer edit.
      if (queryClient.isMutating({ mutationKey }) <= 1) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
      // Members see the change right away too.
      void queryClient.invalidateQueries({ queryKey: ["fan-clu", "pone-rec"] });
    },
  });

  return (change: (episode: AdminPoneRec) => AdminPoneRecUpdate) => {
    const episode = queryClient
      .getQueryData<AdminPoneRecList>(key)
      ?.episodes.find((e) => e.program === program);
    if (!episode) {
      return;
    }
    const data = change(episode);
    const before = Object.fromEntries(
      Object.keys(data).map((field) => [
        field,
        episode[field as keyof AdminPoneRecUpdate],
      ]),
    );
    void queryClient.cancelQueries({ queryKey: key });
    queryClient.setQueryData<AdminPoneRecList>(key, (old) =>
      replaceEpisode(old, program, data),
    );
    mutation.mutate({ data, before });
  };
};
