import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriberList } from "@/hooks/useAdminQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SubscriberListParams } from "@/lib/adminApi";
import { Button } from "../ui/brand/Button";
import { isPlatform, isStatus } from "./labels";
import { SubscribersGrid } from "./SubscribersGrid";
import { ALL, SubscribersToolbar, type Filters } from "./SubscribersToolbar";

const PAGE_SIZE = 50;

const initialFilters: Filters = {
  q: "",
  status: ALL,
  platform: ALL,
};

const toParams = (filters: Filters, page: number): SubscriberListParams => ({
  q: filters.q.trim() || undefined,
  status: isStatus(filters.status) ? filters.status : undefined,
  platform: isPlatform(filters.platform) ? filters.platform : undefined,
  page,
  pageSize: PAGE_SIZE,
});

export function SubscribersPanel() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebouncedValue(filters);
  const list = useSubscriberList(toParams(debouncedFilters, page));

  const totalPages = list.data
    ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE))
    : 1;

  // Deleting the last row of the last page would otherwise leave an empty
  // page on screen.
  if (list.data && page > totalPages) {
    setPage(totalPages);
  }

  return (
    <div className="flex flex-col gap-6">
      <SubscribersToolbar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        counts={list.data?.counts}
        total={list.data?.total}
      />
      {list.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      ) : list.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar la lista de suscriptores.
        </div>
      ) : (
        <SubscribersGrid rows={list.data.items} />
      )}
      <div className="flex items-center justify-end gap-3 text-sm text-text-secondary">
        <span>
          Página {page} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            setPage(page - 1);
          }}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            setPage(page + 1);
          }}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
