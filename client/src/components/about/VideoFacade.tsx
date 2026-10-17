import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Video } from "../../data/about";

type VideoFacadeProps = {
  video: Video;
};

// Shows the YouTube thumbnail and loads the player only when clicked, so the
// page doesn't pull in one heavy embed per video.
export function VideoFacade({ video }: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  // The button that had focus is gone once the player loads.
  useEffect(() => {
    if (playing) {
      playerRef.current?.focus();
    }
  }, [playing]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface">
      {playing ? (
        <iframe
          ref={playerRef}
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setPlaying(true);
          }}
          aria-label={`Reproducir ${video.title}`}
          className="group absolute inset-0 h-full w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand"
        >
          <img
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play
                className="ml-0.5 h-6 w-6"
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
