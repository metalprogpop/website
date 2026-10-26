import { useProgress } from "../../../hooks/useWatchProgress";

// How much of a part was watched on this device, along a tile's bottom edge.
export function WatchProgressBar({ progressId }: { progressId: string }) {
  const progress = useProgress(progressId);
  if (!progress?.d) {
    return null;
  }
  const percent = Math.min(100, (progress.t / progress.d) * 100);
  return (
    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
      <div
        className="h-full bg-brand"
        style={{ width: `${String(percent)}%` }}
      />
    </div>
  );
}
