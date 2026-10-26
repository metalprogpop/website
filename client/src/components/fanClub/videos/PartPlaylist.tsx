import type { FanClubVideoPart } from "shared";
import { progressKey } from "../../../hooks/useWatchProgress";
import { nextPlayable, partTitle } from "../../../lib/fanClubVideos";
import { EpisodeArtwork } from "../../landing/EpisodeArtwork";
import { WatchProgressBar } from "./WatchProgressBar";

function PlaylistItem({
  program,
  part,
  active,
  onSelect,
}: {
  program: number;
  part: FanClubVideoPart;
  active: boolean;
  onSelect: () => void;
}) {
  const episode = part.episodes.at(0);
  const label = `Parte ${String(part.part)}${part.missing ? " · sin video" : active ? " · en pantalla" : ""}`;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={`flex w-full gap-3 rounded-xl p-2 text-left transition-colors ${active ? "bg-brand/10" : "hover:bg-surface"}`}
    >
      <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-text-primary">
        {episode ? (
          <EpisodeArtwork url={episode.artworkUrl} alt="" sizes="128px" />
        ) : null}
        <WatchProgressBar progressId={progressKey(program, part.part)} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span
          className={`line-clamp-2 text-sm font-semibold ${active ? "text-brand" : "text-text-primary"}`}
        >
          {partTitle(part)}
        </span>
      </span>
    </button>
  );
}

// The program's parts as a playlist; the current one advances on its own.
export function PartPlaylist({
  program,
  parts,
  current,
  onSelect,
}: {
  program: number;
  parts: FanClubVideoPart[];
  current: FanClubVideoPart;
  onSelect: (part: FanClubVideoPart) => void;
}) {
  const next = nextPlayable(parts, current);
  return (
    <>
      <h2 className="mb-3 font-display text-lg font-bold text-text-primary">
        En este programa
      </h2>
      <div className="space-y-1">
        {parts.map((part) => (
          <PlaylistItem
            key={part.part}
            program={program}
            part={part}
            active={part === current}
            onSelect={() => {
              onSelect(part);
            }}
          />
        ))}
      </div>
      {next ? (
        <p className="mt-3 text-xs text-text-muted">
          Al terminar sigue la parte {next.part}.
        </p>
      ) : null}
    </>
  );
}
