import { Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { episodeNumberFromPath, episodePath } from "shared";
import { Container } from "../components/layout/Container";
import { formatClock } from "../lib/format";
import { PLAYBACK_RATES, usePlayer, usePlayerTime } from "./PlayerProvider";

const SKIP_SECONDS = 15;

const iconButton =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

// Keeps playing while the listener browses the site. Hidden on the playing
// episode's own page, which has the full player.
export function MiniPlayer() {
  const player = usePlayer();
  const time = usePlayerTime();
  const { pathname } = useLocation();
  const episode = player.episode;

  if (!episode) {
    return null;
  }
  if (episodeNumberFromPath(pathname) === episode.number) {
    return null;
  }

  const duration = time.duration > 0 ? time.duration : episode.durationSeconds;

  return (
    <>
      {/* Room at the end of the page so the bar never covers the footer. */}
      <div aria-hidden="true" className="h-20" />
      <section
        aria-label="Reproductor"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-lg backdrop-blur-lg"
      >
        <ProgressBar
          currentTime={time.currentTime}
          duration={duration}
          onSeek={player.seek}
        />

        <Container>
          <div className="flex h-16 items-center gap-3">
            <Link
              to={episodePath(episode)}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <img
                src={episode.artworkUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold text-text-primary">
                  {episode.album}
                </span>
                <span className="block truncate text-xs text-text-muted">
                  {episode.band ?? "MetalProgPop Cast"}
                </span>
              </span>
            </Link>

            <span className="hidden font-display text-xs font-medium text-text-muted md:block">
              {formatClock(time.currentTime)} / {formatClock(duration)}
            </span>

            <button
              type="button"
              aria-label={`Retroceder ${String(SKIP_SECONDS)} segundos`}
              onClick={() => {
                player.skip(-SKIP_SECONDS);
              }}
              className={`${iconButton} hidden sm:flex`}
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={player.playing ? "Pausar" : "Reproducir"}
              onClick={() => {
                if (player.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {player.playing ? (
                <Pause
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                />
              ) : (
                <Play
                  className="ml-0.5 h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                />
              )}
            </button>
            <button
              type="button"
              aria-label={`Adelantar ${String(SKIP_SECONDS)} segundos`}
              onClick={() => {
                player.skip(SKIP_SECONDS);
              }}
              className={`${iconButton} hidden sm:flex`}
            >
              <RotateCw className="h-5 w-5" aria-hidden="true" />
            </button>

            <select
              aria-label="Velocidad"
              value={player.rate}
              onChange={(e) => {
                player.setRate(Number(e.target.value));
              }}
              className="hidden rounded-lg border border-border bg-surface px-2 py-1.5 font-display text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:block"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label="Cerrar reproductor"
              onClick={player.close}
              className={iconButton}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </section>
    </>
  );
}

type ProgressBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
};

// A thin bar along the top edge; an invisible range input over it keeps it
// draggable and keyboard-accessible.
function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="relative h-1 bg-border">
      <div
        className="h-full bg-brand"
        style={{ width: `${String(progress)}%` }}
      />
      <input
        type="range"
        aria-label="Posición"
        min={0}
        max={Math.max(1, Math.floor(duration))}
        step={1}
        value={Math.floor(currentTime)}
        onChange={(e) => {
          onSeek(Number(e.target.value));
        }}
        className="absolute inset-x-0 -top-2 h-5 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
