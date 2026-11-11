import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AdminPoneRecList, AdminPoneRecUpdate } from "shared";
import { adminApi } from "../lib/adminApi";

const key = ["admin", "pone-rec"] as const;

export const useAdminPoneRecs = () =>
  useQuery({ queryKey: key, queryFn: adminApi.listPoneRecs });

// Every edit shows at once; if the save fails it rolls back and says why.
export const useUpdatePoneRec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      program,
      data,
    }: {
      program: number;
      data: AdminPoneRecUpdate;
    }) => adminApi.updatePoneRec(program, data),
    onMutate: async ({ program, data }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<AdminPoneRecList>(key);
      queryClient.setQueryData<AdminPoneRecList>(key, (old) =>
        old
          ? {
              ...old,
              episodes: old.episodes.map((episode) =>
                episode.program === program ? { ...episode, ...data } : episode,
              ),
            }
          : old,
      );
      return { before };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(key, context?.before);
      toast.error(error.message);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<AdminPoneRecList>(key, (old) =>
        old
          ? {
              tags: [...new Set([...old.tags, ...saved.tags])].sort((a, b) =>
                a.localeCompare(b, "es"),
              ),
              episodes: old.episodes.map((episode) =>
                episode.program === saved.program ? saved : episode,
              ),
            }
          : old,
      );
    },
    onSettled: () => {
      // Members see the change right away too.
      void queryClient.invalidateQueries({ queryKey: ["fan-clu", "pone-rec"] });
    },
  });
};
