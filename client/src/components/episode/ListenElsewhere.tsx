import { FaApple, FaSpotify, FaYoutube } from "react-icons/fa";
import { platforms } from "../../data/platforms";

const icons = { spotify: FaSpotify, apple: FaApple, youtube: FaYoutube };

// The feed carries no per-episode links for these platforms, so they lead to
// the show's page on each one.
export function ListenElsewhere() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="font-display text-sm text-text-muted">También en</span>
      {platforms.map((platform) => {
        if (platform.iconName === "rss") {
          return null;
        }
        const Icon = icons[platform.iconName];
        return (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-text-secondary transition-colors hover:text-brand"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {platform.name}
          </a>
        );
      })}
    </div>
  );
}
