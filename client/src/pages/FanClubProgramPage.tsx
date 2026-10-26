import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import type { FanClubVideoPart } from "shared";
import {
  ProgramPageShell as Shell,
  Spinner,
} from "../components/fanClub/videos/ProgramPageShell";
import { ProgramVideo } from "../components/fanClub/videos/ProgramVideo";
import { PartPlaylist } from "../components/fanClub/videos/PartPlaylist";
import { useAuth } from "../hooks/useAuth";
import { useFanClubVideos } from "../hooks/useFanClubVideos";
import { nextPlayable, programPath } from "../lib/fanClubVideos";

const backLink =
  "font-display text-sm font-semibold text-brand transition-colors hover:text-brand-hover";

// One program in theater mode: the player, the part's details and the
// program's parts as a playlist. Members only; everyone else goes to the
// Fan Clú's home.
export function FanClubProgramPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { programNumber } = useParams();
  const [params, setParams] = useSearchParams();
  const videos = useFanClubVideos({ enabled: !!user?.fanClubAccess });
  // The part chosen to start playing on its own (a playlist click or the
  // previous part ending); landing on a page never autoplays.
  const [autoPlayKey, setAutoPlayKey] = useState<string | null>(null);

  if (authLoading) {
    return (
      <Shell>
        <Spinner />
      </Shell>
    );
  }
  if (!user?.fanClubAccess) {
    return <Navigate to="/fan-clu" replace />;
  }
  if (videos.isPending) {
    return (
      <Shell>
        <Spinner />
      </Shell>
    );
  }

  const programs = videos.data ?? [];
  const index = programs.findIndex((p) => String(p.number) === programNumber);
  const program = programs.at(index);
  if (videos.isError || index < 0 || !program) {
    return (
      <Shell>
        <Link to="/fan-clu" className={backLink}>
          ← Fan Clú
        </Link>
        <p className="mt-6 text-text-muted">
          {videos.isError
            ? "No pudimos cargar los videos. Probá de nuevo en un rato."
            : "No encontramos ese programa."}
        </p>
      </Shell>
    );
  }

  const requested = Number(params.get("parte"));
  const current =
    program.parts.find((p) => p.part === requested) ?? program.parts.at(0);
  if (!current) {
    return <Navigate to="/fan-clu" replace />;
  }
  const keyOf = (part: FanClubVideoPart) =>
    `${String(program.number)}-${String(part.part)}`;
  const select = (part: FanClubVideoPart, play: boolean) => {
    setAutoPlayKey(play ? keyOf(part) : null);
    setParams({ parte: String(part.part) }, { replace: true });
  };
  const next = nextPlayable(program.parts, current);
  const older = programs.at(index + 1);
  const newer = index > 0 ? programs.at(index - 1) : undefined;

  return (
    <Shell>
      <Link to="/fan-clu" className={backLink}>
        ← Fan Clú
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ProgramVideo
          program={program}
          part={current}
          autoPlay={autoPlayKey === keyOf(current)}
          onEnded={() => {
            if (next) {
              select(next, true);
            }
          }}
        />
        <aside>
          <PartPlaylist
            program={program.number}
            parts={program.parts}
            current={current}
            onSelect={(part) => {
              select(part, true);
            }}
          />
          <nav
            aria-label="Otros programas"
            className="mt-8 flex justify-between border-t border-border pt-4"
          >
            {older ? (
              <Link to={programPath(older.number)} className={backLink}>
                ← Programa {older.number}
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link to={programPath(newer.number)} className={backLink}>
                Programa {newer.number} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </aside>
      </div>
    </Shell>
  );
}
