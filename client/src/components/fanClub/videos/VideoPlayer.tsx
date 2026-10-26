import { useEffect, useRef, useState } from "react";
import type { FanClubVideoPart } from "shared";
import { usePartUrls } from "../../../hooks/useFanClubVideos";
import {
  isStarted,
  progressKey,
  readProgress,
  saveProgress,
} from "../../../hooks/useWatchProgress";
import { usePlayer } from "../../../player/PlayerProvider";
import { Button } from "../../ui/brand/Button";
import { Skeleton } from "../../ui/skeleton";

const SAVE_EVERY_SECONDS = 5;

const poster = (url: string | undefined) =>
  url?.replace(/(\/i\/\d+).*/, "$1/600x600/c");

// Plays one part from its presigned URL and resumes where it was left on
// this device. A URL that stops working (it expired while paused) is signed
// again once, and playback picks up at the same second.
export function VideoPlayer({
  program,
  part,
  autoPlay,
  onEnded,
}: {
  program: number;
  part: FanClubVideoPart;
  autoPlay: boolean;
  onEnded: () => void;
}) {
  const key = progressKey(program, part.part);
  const urls = usePartUrls(program, part.part, true);
  const player = usePlayer();
  const lastSave = useRef(0);
  const resume = useRef<{ at: number; play: boolean } | null>(null);
  const renewed = useRef(false);
  // The part whose URL failed again after signing a new one: stop and say
  // so (keyed, so another part starts clean).
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const failed = failedKey === key;

  useEffect(() => {
    lastSave.current = 0;
    resume.current = null;
    renewed.current = false;
  }, [key]);

  if (urls.isError || failed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl bg-text-primary p-6 text-center text-white">
        <p>No pudimos cargar el video.</p>
        <Button
          size="sm"
          onClick={() => {
            renewed.current = false;
            setFailedKey(null);
            void urls.refetch();
          }}
        >
          Probar de nuevo
        </Button>
      </div>
    );
  }
  if (!urls.data) {
    return (
      <Skeleton
        role="status"
        aria-label="Cargando video"
        className="aspect-video w-full rounded-2xl"
      />
    );
  }

  return (
    <video
      key={key}
      src={urls.data.url}
      poster={poster(part.episodes.at(0)?.artworkUrl)}
      controls
      playsInline
      preload="metadata"
      autoPlay={autoPlay}
      aria-label={`Video: programa ${String(program)}, parte ${String(part.part)}`}
      className="aspect-video w-full rounded-2xl bg-black object-contain shadow-xl"
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        const saved = readProgress(key);
        if (resume.current) {
          video.currentTime = resume.current.at;
          if (resume.current.play) {
            void video.play();
          }
          resume.current = null;
        } else if (saved && isStarted(saved)) {
          video.currentTime = saved.t;
        }
      }}
      onPlaying={() => {
        renewed.current = false;
      }}
      onPlay={() => {
        // One thing at a time: a video pauses the podcast mini-player.
        player.pause();
      }}
      onError={(event) => {
        if (renewed.current) {
          setFailedKey(key);
          return;
        }
        const video = event.currentTarget;
        renewed.current = true;
        resume.current = { at: video.currentTime, play: !video.paused };
        void urls.refetch();
      }}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        if (
          Math.abs(video.currentTime - lastSave.current) > SAVE_EVERY_SECONDS
        ) {
          lastSave.current = video.currentTime;
          saveProgress(key, video.currentTime, video.duration);
        }
      }}
      onEnded={(event) => {
        saveProgress(
          key,
          event.currentTarget.duration,
          event.currentTarget.duration,
        );
        onEnded();
      }}
    />
  );
}
