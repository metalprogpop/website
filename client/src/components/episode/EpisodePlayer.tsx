import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { formatClock } from "../../lib/format";
import {
  PLAYBACK_RATES,
  usePlayer,
  usePlayerTime,
  type PlayerEpisode,
} from "../../player/PlayerProvider";
import { savedPosition } from "../../player/storage";

const SKIP_SECONDS = 15;

type EpisodePlayerProps = {
  episode: PlayerEpisode;
};

// The full player on an episode page. It drives the app-wide audio, so
// playback carries on when the listener navigates away.
export function EpisodePlayer({ episode }: EpisodePlayerProps) {
  const player = usePlayer();
  const time = usePlayerTime();
  const isCurrent = player.episode?.number === episode.number;
  const isPlaying = isCurrent && player.playing;
  const duration =
    isCurrent && time.duration > 0 ? time.duration : episode.durationSeconds;
  // Not playing yet: show where this browser left the episode, if anywhere.
  const currentTime = isCurrent
    ? time.currentTime
    : savedPosition(episode.number);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          onClick={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play(episode);
            }
          }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" fill="currentColor" aria-hidden="true" />
          ) : (
            <Play
              className="ml-0.5 h-6 w-6"
              fill="currentColor"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            aria-label="Posición"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.floor(currentTime)}
            disabled={!isCurrent}
            onChange={(e) => {
              player.seek(Number(e.target.value));
            }}
            className="w-full accent-brand disabled:opacity-60"
          />
          <div className="mt-1 flex justify-between font-display text-xs font-medium text-text-muted">
            <span>{formatClock(currentTime)}</span>
            <span>{formatClock(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Retroceder ${String(SKIP_SECONDS)} segundos`}
            disabled={!isCurrent}
            onClick={() => {
              player.skip(-SKIP_SECONDS);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-brand disabled:opacity-40"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Adelantar ${String(SKIP_SECONDS)} segundos`}
            disabled={!isCurrent}
            onClick={() => {
              player.skip(SKIP_SECONDS);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-brand disabled:opacity-40"
          >
            <RotateCw className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label className="flex items-center gap-2 font-display text-sm text-text-secondary">
          Velocidad
          <select
            value={player.rate}
            onChange={(e) => {
              player.setRate(Number(e.target.value));
            }}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 font-display text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
