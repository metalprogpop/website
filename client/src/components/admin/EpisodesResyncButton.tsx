import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/brand/Button";
import { adminApi } from "../../lib/adminApi";

// The hourly sync only refreshes the newest episodes. This re-reads the whole
// feed: it fixes episodes that were uploaded with mistakes and hides the ones
// removed from Audioboom.
export function EpisodesResyncButton() {
  const queryClient = useQueryClient();
  const resync = useMutation({
    mutationFn: adminApi.resyncEpisodes,
    onSuccess: async ({ total, hidden }) => {
      toast.success(
        hidden > 0
          ? `Episodios actualizados: ${String(total)} publicados, ${String(hidden)} ocultos`
          : `Episodios actualizados: ${String(total)} publicados`,
      );
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={resync.isPending}
      onClick={() => {
        resync.mutate();
      }}
    >
      <RefreshCw
        className={`h-4 w-4 ${resync.isPending ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {resync.isPending
        ? "Actualizando episodios…"
        : "Volver a cargar todos los episodios"}
    </Button>
  );
}
