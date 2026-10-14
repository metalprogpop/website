import { useEffect, useRef, type RefObject } from "react";
import type { PlayerEpisode } from "./PlayerProvider";

const SKIP_SECONDS = 15;

type Controls = {
  episode: PlayerEpisode | null;
  playing: boolean;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
};

const supported = () =>
  typeof navigator !== "undefined" &&
  "mediaSession" in navigator &&
  typeof MediaMetadata !== "undefined";

// Artwork, title and play/pause/seek on the phone's lock screen, in the
// notification shade and on media keys.
export function useMediaSession(
  controls: Controls,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  // Handlers are registered once and read the latest controls from here.
  const latest = useRef(controls);
  useEffect(() => {
    latest.current = controls;
  });

  const { episode, playing } = controls;

  useEffect(() => {
    if (!supported()) {
      return;
    }
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      [
        "play",
        () => {
          latest.current.play();
        },
      ],
      [
        "pause",
        () => {
          latest.current.pause();
        },
      ],
      [
        "seekbackward",
        (details) => {
          latest.current.skip(-(details.seekOffset ?? SKIP_SECONDS));
        },
      ],
      [
        "seekforward",
        (details) => {
          latest.current.skip(details.seekOffset ?? SKIP_SECONDS);
        },
      ],
      [
        "seekto",
        (details) => {
          if (details.seekTime !== undefined) {
            latest.current.seek(details.seekTime);
          }
        },
      ],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Browsers reject actions they don't support.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Same as above.
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!supported()) {
      return;
    }
    navigator.mediaSession.metadata = episode
      ? new MediaMetadata({
          title: episode.album,
          artist: episode.band ?? "MetalProgPop Cast",
          album: "MetalProgPop Cast",
          artwork: [{ src: episode.artworkUrl, sizes: "1400x1400" }],
        })
      : null;
  }, [episode]);

  useEffect(() => {
    if (!supported()) {
      return;
    }
    navigator.mediaSession.playbackState = playing
      ? "playing"
      : episode
        ? "paused"
        : "none";
  }, [playing, episode]);

  // Keeps the lock-screen scrubber in step with the audio.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !supported() || !playing) {
      return;
    }
    const update = () => {
      if (Number.isFinite(audio.duration)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: Math.min(audio.currentTime, audio.duration),
          });
        } catch {
          // Inconsistent values mid-seek; the next update fixes it.
        }
      }
    };
    update();
    audio.addEventListener("seeked", update);
    audio.addEventListener("ratechange", update);
    audio.addEventListener("loadedmetadata", update);
    return () => {
      audio.removeEventListener("seeked", update);
      audio.removeEventListener("ratechange", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [audioRef, playing]);
}
