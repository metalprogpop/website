import { Link } from "react-router-dom";
import type { EpisodeSummary } from "shared";
import { EpisodeCard } from "../landing/EpisodeCard";

type RelatedEpisodesProps = {
  episodes: EpisodeSummary[];
};

export function RelatedEpisodes({ episodes }: RelatedEpisodesProps) {
  return (
    <section aria-labelledby="related-heading">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Seguí escuchando
        </span>
        <h2
          id="related-heading"
          className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
        >
          Si te gustó este episodio, seguí por acá
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.number} episode={episode} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/episodes"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-base font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand"
        >
          Ver todos
        </Link>
      </div>
    </section>
  );
}
