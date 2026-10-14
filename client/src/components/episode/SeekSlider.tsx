import { useRef, useState } from "react";
import { formatClock } from "../../lib/format";

type SeekSliderProps = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
  // "inline": elapsed | slider | total, in one row. "below": times under it.
  times?: "inline" | "below";
};

// A draggable position slider. While dragging it only previews the target
// time; the audio jumps once, on release. Keyboard steps seek right away.
export function SeekSlider({
  currentTime,
  duration,
  onSeek,
  disabled = false,
  times = "below",
}: SeekSliderProps) {
  const draggingRef = useRef(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const max = Math.max(1, Math.floor(duration));
  const value = Math.min(max, dragValue ?? Math.floor(currentTime));

  const commit = (input: HTMLInputElement) => {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    setDragValue(null);
    onSeek(Number(input.value));
  };

  const slider = (
    <input
      type="range"
      aria-label="Posición"
      aria-valuetext={`${formatClock(value)} de ${formatClock(duration)}`}
      min={0}
      max={max}
      step={1}
      value={value}
      disabled={disabled}
      onPointerDown={() => {
        draggingRef.current = true;
      }}
      onChange={(e) => {
        const next = Number(e.target.value);
        if (draggingRef.current) {
          setDragValue(next);
        } else {
          onSeek(next);
        }
      }}
      onPointerUp={(e) => {
        commit(e.currentTarget);
      }}
      onPointerCancel={(e) => {
        commit(e.currentTarget);
      }}
      onBlur={(e) => {
        commit(e.currentTarget);
      }}
      style={{ backgroundSize: `${String((value / max) * 100)}% 100%` }}
      className="seek-slider w-full"
    />
  );

  const elapsed = <span className="tabular-nums">{formatClock(value)}</span>;
  const total = <span className="tabular-nums">{formatClock(duration)}</span>;

  if (times === "inline") {
    return (
      <div className="flex w-full items-center gap-3 font-display text-xs font-medium text-text-muted">
        {elapsed}
        <div className="flex flex-1 items-center">{slider}</div>
        {total}
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="flex h-5 items-center">{slider}</div>
      <div className="mt-1 flex justify-between font-display text-xs font-medium text-text-muted">
        {elapsed}
        {total}
      </div>
    </div>
  );
}
