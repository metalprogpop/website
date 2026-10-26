import { useEffect } from "react";
import { Button } from "../../ui/brand/Button";
import { partTitle, type PartItem } from "../../../lib/fanClubVideos";

// Touch's way to take a part out of "Seguí mirando" (long press on a tile):
// a bottom sheet on phones, a dialog on wider screens.
export function RemoveFromContinueSheet({
  item,
  onCancel,
  onConfirm,
}: {
  item: PartItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-continue-title"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-full max-w-md rounded-t-3xl bg-surface p-6 pb-8 shadow-2xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <p className="text-xs text-text-muted">
          Programa {item.program.number} · parte {item.part.part}
        </p>
        <h2
          id="remove-continue-title"
          className="mb-6 font-display text-xl font-bold text-text-primary"
        >
          {partTitle(item.part)}
        </h2>
        <div className="grid gap-3">
          <Button autoFocus onClick={onConfirm}>
            Sacar de “Seguí mirando”
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
