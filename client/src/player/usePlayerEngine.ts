import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type AudioHTMLAttributes,
  type RefObject,
} from "react";
import {
  clearPosition,
  saveEpisode,
  savePosition,
  saveRate,
  savedEpisode,
  savedPosition,
  savedRate,
} from "./storage";
import {
  PLAYBACK_RATES,
  type PlayerControls,
  type PlayerEpisode,
  type PlayerTime,
} from "./types";

// How often the position is remembered while playing.
const SAVE_EVERY_SECONDS = 5;
// Closer than this to the end, an episode counts as finished: the next play
// starts from the beginning.
const FINISHED_MARGIN_SECONDS = 30;

const resumePoint = (episode: PlayerEpisode): number => {
  const seconds = savedPosition(episode.number);
  return seconds < episode.durationSeconds - FINISHED_MARGIN_SECONDS
    ? seconds
    : 0;
};

type AudioProps = AudioHTMLAttributes<HTMLAudioElement> & {
  ref: RefObject<HTMLAudioElement>;
};

// Drives the app's single <audio>: what is loaded, playback controls, and
// remembering in this browser the last episode, where each one was left and
// the speed. A remembered episode is shown right away but only loaded (and
// downloaded) when played.
export function usePlayerEngine(): {
  controls: PlayerControls;
  time: PlayerTime;
  audioProps: AudioProps;
} {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [episode, setEpisode] = useState<PlayerEpisode | null>(savedEpisode);
  const episodeRef = useRef(episode);
  // The episode whose audio is loaded in the element, if any.
  const loadedRef = useRef<number | null>(null);
  // Where to jump once the loaded audio's metadata arrives.
  const pendingSeekRef = useRef(0);
  const lastSavedRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(() =>
    savedRate(PLAYBACK_RATES),
  );
  const rateRef = useRef(playbackRate);
  const [time, setTime] = useState<PlayerTime>(() =>
    episode
      ? { currentTime: resumePoint(episode), duration: episode.durationSeconds }
      : { currentTime: 0, duration: 0 },
  );

  const isLoaded = (current: PlayerEpisode) =>
    loadedRef.current === current.number;

  const play = useCallback((next?: PlayerEpisode) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (next && next.number !== episodeRef.current?.number) {
      episodeRef.current = next;
      setEpisode(next);
      saveEpisode(next);
      setTime({
        currentTime: resumePoint(next),
        duration: next.durationSeconds,
      });
    }
    const current = episodeRef.current;
    if (!current) {
      return;
    }
    if (loadedRef.current !== current.number) {
      loadedRef.current = current.number;
      pendingSeekRef.current = resumePoint(current);
      lastSavedRef.current = pendingSeekRef.current;
      audio.src = current.audioUrl;
      // A new source resets playbackRate to defaultPlaybackRate.
      audio.defaultPlaybackRate = rateRef.current;
      audio.playbackRate = rateRef.current;
    }
    // play() rejects when the browser blocks it or the source fails.
    Promise.resolve(audio.play()).catch(() => {
      setPlaying(false);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // Before the audio is loaded, seeking moves the remembered position, which
  // is where playback will start.
  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    const current = episodeRef.current;
    if (!audio || !current) {
      return;
    }
    const target = Math.max(0, seconds);
    if (isLoaded(current)) {
      audio.currentTime = target;
    } else {
      setTime((prev) => ({ ...prev, currentTime: target }));
    }
    savePosition(current.number, target);
  }, []);

  const skip = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      const current = episodeRef.current;
      if (!audio || !current) {
        return;
      }
      const from = isLoaded(current) ? audio.currentTime : resumePoint(current);
      seek(from + deltaSeconds);
    },
    [seek],
  );

  const changeRate = useCallback((next: number) => {
    rateRef.current = next;
    const audio = audioRef.current;
    if (audio) {
      audio.defaultPlaybackRate = next;
      audio.playbackRate = next;
    }
    setPlaybackRate(next);
    saveRate(next);
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    loadedRef.current = null;
    episodeRef.current = null;
    setEpisode(null);
    saveEpisode(null);
  }, []);

  const controls = useMemo<PlayerControls>(
    () => ({
      episode,
      playing,
      rate: playbackRate,
      play,
      pause,
      seek,
      skip,
      setRate: changeRate,
      close,
    }),
    [
      episode,
      playing,
      playbackRate,
      play,
      pause,
      seek,
      skip,
      changeRate,
      close,
    ],
  );

  const syncTime = (audio: HTMLAudioElement) => {
    setTime({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration)
        ? audio.duration
        : (episodeRef.current?.durationSeconds ?? 0),
    });
  };

  const rememberPosition = (audio: HTMLAudioElement, force = false) => {
    const current = episodeRef.current;
    if (!current) {
      return;
    }
    if (!isLoaded(current)) {
      return;
    }
    const moved = Math.abs(audio.currentTime - lastSavedRef.current);
    if (force || moved >= SAVE_EVERY_SECONDS) {
      lastSavedRef.current = audio.currentTime;
      savePosition(current.number, audio.currentTime);
    }
  };

  const audioProps: AudioProps = {
    ref: audioRef,
    preload: "metadata",
    onPlay: () => {
      setPlaying(true);
    },
    onPause: (e) => {
      setPlaying(false);
      rememberPosition(e.currentTarget, true);
    },
    onEnded: () => {
      setPlaying(false);
      if (episodeRef.current) {
        clearPosition(episodeRef.current.number);
      }
    },
    onTimeUpdate: (e) => {
      syncTime(e.currentTarget);
      rememberPosition(e.currentTarget);
    },
    onLoadedMetadata: (e) => {
      const audio = e.currentTarget;
      if (pendingSeekRef.current > 0) {
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = 0;
      }
      syncTime(audio);
    },
  };

  return { controls, time, audioProps };
}
