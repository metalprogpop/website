import { useState } from "react";
import { toast } from "sonner";
import type { FanClubProgram } from "shared";
import {
  progressKey,
  removeProgress,
  restoreProgress,
  useStartedParts,
} from "../../../hooks/useWatchProgress";
import type { PartItem } from "../../../lib/fanClubVideos";
import { ContinueTile } from "./ContinueTile";
import { RemoveFromContinueSheet } from "./RemoveFromContinueSheet";
import { ScrollRow } from "./ScrollRow";

const keyOf = (item: PartItem) =>
  progressKey(item.program.number, item.part.part);

// Parts started on this device, whatever the filter or search: it's what
// you were watching. A mouse removes one with the X on hover; touch, with a
// long press and a confirmation. Both can be undone.
export function ContinueRow({ programs }: { programs: FanClubProgram[] }) {
  const started = useStartedParts(programs);
  const [confirming, setConfirming] = useState<PartItem | null>(null);

  const remove = (item: PartItem) => {
    const saved = removeProgress(keyOf(item));
    toast("Lo sacamos de “Seguí mirando”", {
      action: {
        label: "Deshacer",
        onClick: () => {
          if (saved) {
            restoreProgress(keyOf(item), saved);
          }
        },
      },
    });
  };

  if (started.length === 0) {
    return null;
  }
  return (
    <>
      <ScrollRow title="Seguí mirando">
        {started.map((item) => (
          <ContinueTile
            key={keyOf(item)}
            item={item}
            onRemove={() => {
              remove(item);
            }}
            onLongPress={() => {
              setConfirming(item);
            }}
          />
        ))}
      </ScrollRow>
      {confirming ? (
        <RemoveFromContinueSheet
          item={confirming}
          onCancel={() => {
            setConfirming(null);
          }}
          onConfirm={() => {
            remove(confirming);
            setConfirming(null);
          }}
        />
      ) : null}
    </>
  );
}
