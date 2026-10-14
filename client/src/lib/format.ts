// "128 min": episode lengths on cards and the episode page.
export function formatDuration(seconds: number): string {
  return `${String(Math.floor(seconds / 60))} min`;
}

// "29 ago 2026".
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "1:02:03" or "2:03": the player's elapsed and total time.
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h > 0
    ? `${String(h)}:${String(m).padStart(2, "0")}:${s}`
    : `${String(m)}:${s}`;
}
