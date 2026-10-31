import { Headphones } from "lucide-react";
import type { PoneRec } from "shared";
import { dayMonth } from "../../../lib/fanClubVideos";
import { minutes, thumbnailUrl } from "../../../lib/poneRec";
import { PoneRecPlayButton } from "./PoneRecPlayButton";

// One episode: its thumbnail and only its main topic, as decided. Topics
// and tags stay out of sight; they're for search.
export function PoneRecCard({ rec }: { rec: PoneRec }) {
  const image = thumbnailUrl(rec);
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-text-primary">
        {image ? (
          <img
            src={image}
            alt=""
            width={768}
            height={768}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Headphones
            className="absolute inset-0 m-auto h-16 w-16 text-white/40"
            aria-hidden="true"
          />
        )}
        <div className="absolute bottom-3 right-3">
          <PoneRecPlayButton rec={rec} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-3 font-display text-base font-semibold leading-snug sm:text-lg text-text-primary">
          {rec.mainTopic}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Programa {rec.program}
          {rec.publishedAt ? ` · ${dayMonth(rec.publishedAt)}` : ""} ·{" "}
          {minutes(rec.durationSeconds)}
        </p>
      </div>
    </article>
  );
}
