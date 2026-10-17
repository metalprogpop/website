import { lecheenpolvoChannel, videos } from "../../data/about";
import { VideoFacade } from "./VideoFacade";

export function LecheenpolvoVideos() {
  return (
    <section aria-labelledby="lecheenpolvo">
      <div className="mb-12 text-center">
        <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
          También tocamos
        </span>
        <h2
          id="lecheenpolvo"
          className="mb-4 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
        >
          Lecheenpolvo & Friends
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-text-secondary">
          La música no es solo para charlarla. Desde hace más de una década
          grabamos covers con amigos en el proyecto del Dr. Ángel. Estos son
          algunos donde tocamos al menos dos de nosotros.
        </p>
      </div>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.youtubeId}>
            <VideoFacade video={video} />
            <h3 className="mt-4 font-display text-lg font-semibold text-text-primary">
              {video.title}
            </h3>
            <p className="text-sm text-text-muted">
              {video.players} · {video.year}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center">
        <a
          href={lecheenpolvoChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          Ver todos los videos en YouTube
        </a>
      </p>
    </section>
  );
}
