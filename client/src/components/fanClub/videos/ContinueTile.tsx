import { useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { progressKey } from "../../../hooks/useWatchProgress";
import {
  partTitle,
  programPath,
  type PartItem,
} from "../../../lib/fanClubVideos";
import { EpisodeArtwork } from "../../landing/EpisodeArtwork";
import { WatchProgressBar } from "./WatchProgressBar";

const LONG_PRESS_MS = 500;

// A started part. Mouse: an X shows on hover. Touch: a long press (that
// doesn't open the part) asks to remove it.
export function ContinueTile({
  item,
  onRemove,
  onLongPress,
}: {
  item: PartItem;
  onRemove: () => void;
  onLongPress: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const pressed = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const cancel = () => {
    window.clearTimeout(timer.current);
  };
  const episode = item.part.episodes.at(0);

  return (
    <div
      className="group/tile relative w-60 shrink-0 select-none snap-start sm:w-72"
      style={{ WebkitTouchCallout: "none" }}
    >
      <Link
        to={programPath(item.program.number, item.part.part)}
        onContextMenu={(e) => {
          if (pressed.current) {
            e.preventDefault();
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") {
            return;
          }
          pressed.current = false;
          start.current = { x: e.clientX, y: e.clientY };
          timer.current = window.setTimeout(() => {
            pressed.current = true;
            // Safari has no vibration API.
            if ("vibrate" in navigator) {
              navigator.vibrate(15);
            }
            onLongPress();
          }, LONG_PRESS_MS);
        }}
        onPointerMove={(e) => {
          if (
            Math.hypot(
              e.clientX - start.current.x,
              e.clientY - start.current.y,
            ) > 10
          ) {
            cancel();
          }
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onClick={(e) => {
          if (pressed.current) {
            e.preventDefault();
            pressed.current = false;
          }
        }}
        className="block"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-text-primary">
          {episode ? (
            <EpisodeArtwork url={episode.artworkUrl} alt="" sizes="300px" />
          ) : null}
          <WatchProgressBar
            progressId={progressKey(item.program.number, item.part.part)}
          />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Programa {item.program.number} · parte {item.part.part}
        </p>
        <p className="line-clamp-1 text-sm font-medium text-text-primary group-hover/tile:text-brand">
          {partTitle(item.part)}
        </p>
      </Link>
      <button
        type="button"
        aria-label={`Sacar de “Seguí mirando”: ${partTitle(item.part)}`}
        onClick={onRemove}
        className="absolute right-2 top-2 hidden h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-brand focus-visible:opacity-100 pointer-fine:flex pointer-fine:group-hover/tile:opacity-100"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
