import { useState } from "react";
import {
  useAdminPoneRecs,
  useUpdatePoneRec,
} from "../../../hooks/useAdminPoneRecs";
import { Skeleton } from "../../ui/skeleton";
import { AdminPoneRecCard } from "./AdminPoneRecCard";
import { PoneRecEditSheet } from "./PoneRecEditSheet";

const GRID =
  "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

// Every published Poné Rec™, as members see it, newest first. A card opens
// its editor: main topic, tags and image.
export function PoneRecAdminPanel() {
  const { data, isLoading, isError } = useAdminPoneRecs();
  const update = useUpdatePoneRec();
  const [editing, setEditing] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando Poné Rec™" className={GRID}>
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="mt-3 h-5 w-4/5" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        No pudimos cargar Poné Rec™. Probá de nuevo en un rato.
      </div>
    );
  }
  if (data.episodes.length === 0) {
    return <p className="text-text-muted">Todavía no hay episodios.</p>;
  }
  return (
    <>
      <ul className={GRID}>
        {data.episodes.map((rec) => (
          <li key={rec.program}>
            <AdminPoneRecCard
              rec={rec}
              onOpen={() => {
                setEditing(rec.program);
              }}
            />
          </li>
        ))}
      </ul>
      <PoneRecEditSheet
        rec={data.episodes.find((rec) => rec.program === editing)}
        tags={data.tags}
        onSave={(program, change) => {
          update.mutate({ program, data: change });
        }}
        onClose={() => {
          setEditing(null);
        }}
      />
    </>
  );
}
