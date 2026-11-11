import type { AdminPoneRec } from "shared";
import { dayMonth } from "../../../lib/fanClubVideos";
import { minutes } from "../../../lib/poneRec";
import { DefaultImageBadge } from "./DefaultImageBadge";
import { PoneRecImage } from "./PoneRecImage";

export const chosenImagePath = (rec: AdminPoneRec) =>
  rec.thumbnails.find((t) => t.id === rec.thumbnailId)?.path ?? null;

// The member's card, as members see it (title in full), opening the editor.
export function AdminPoneRecCard({
  rec,
  onOpen,
}: {
  rec: AdminPoneRec;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Editar el Poné Rec™ del programa ${String(rec.program)}: ${rec.mainTopic}`}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
    >
      <PoneRecImage path={chosenImagePath(rec)} className="w-full" />
      <span className="absolute left-2 top-2">
        <DefaultImageBadge rec={rec} />
      </span>
      <span className="block p-4">
        <span className="block font-display text-base font-semibold leading-snug text-text-primary sm:text-lg">
          {rec.mainTopic}
        </span>
        <span className="mt-1 block text-xs text-text-muted">
          Programa {rec.program}
          {rec.publishedAt ? ` · ${dayMonth(rec.publishedAt)}` : ""} ·{" "}
          {minutes(rec.durationSeconds)}
        </span>
      </span>
    </button>
  );
}
