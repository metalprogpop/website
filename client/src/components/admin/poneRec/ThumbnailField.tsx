import { Check } from "lucide-react";
import type { AdminPoneRec } from "shared";
import { PoneRecImage } from "./PoneRecImage";

// Pick one of the episode's images, or the default one.
export function ThumbnailField({
  rec,
  onSave,
}: {
  rec: AdminPoneRec;
  onSave: (thumbnailId: number | null) => void;
}) {
  const options = [
    ...rec.thumbnails.map((t) => ({ id: t.id, path: t.path })),
    { id: null, path: null },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {options.map((option, index) => {
        const selected = rec.thumbnailId === option.id;
        return (
          <button
            key={option.id ?? "default"}
            type="button"
            aria-pressed={selected}
            aria-label={
              option.id === null
                ? "Portada default"
                : `Opción ${String(index + 1)}`
            }
            onClick={() => {
              if (!selected) {
                onSave(option.id);
              }
            }}
            className={`relative overflow-hidden rounded-xl ring-offset-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/50 ${selected ? "ring-4 ring-brand" : "opacity-80 hover:opacity-100"}`}
          >
            <PoneRecImage path={option.path} className="w-full" />
            {option.id === null && (
              <span className="absolute inset-x-0 bottom-1.5 text-center text-xs font-semibold text-white">
                Default
              </span>
            )}
            {selected && (
              <Check
                className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full bg-brand p-0.5 text-white"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
