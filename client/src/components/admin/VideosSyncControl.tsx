import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Film } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../lib/adminApi";
import { Button } from "../ui/brand/Button";

// Videos don't change once uploaded, so nothing syncs them on a schedule:
// after uploading a program, staff sync here. The quick sync re-checks the
// two newest programs and adds any it doesn't know; "Revisar todos" re-reads
// the whole bucket and hides the videos that are no longer there.
export function VideosSyncControl() {
  const queryClient = useQueryClient();
  const sync = useMutation({
    mutationFn: adminApi.syncVideos,
    onSuccess: async ({ total, added, hidden }) => {
      const details = [
        added > 0 ? `${String(added)} nuevos` : null,
        hidden > 0 ? `${String(hidden)} ocultos` : null,
      ].filter((detail) => detail !== null);
      toast.success(
        `Videos sincronizados: ${String(total)} publicados${details.length > 0 ? `, ${details.join(", ")}` : ""}`,
      );
      // Exact: the signed URLs below this key must not refetch mid-playback.
      await queryClient.invalidateQueries({
        queryKey: ["fan-clu", "videos"],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        variant="secondary"
        size="sm"
        disabled={sync.isPending}
        onClick={() => {
          sync.mutate(false);
        }}
      >
        <Film
          className={`h-4 w-4 ${sync.isPending ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        {sync.isPending ? "Sincronizando videos…" : "Sincronizar videos"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={sync.isPending}
        onClick={() => {
          sync.mutate(true);
        }}
      >
        Revisar todos
      </Button>
    </div>
  );
}
