import { FaSpotify, FaApple, FaYoutube, FaRss } from 'react-icons/fa';
import type { Platform } from '../../data/platforms';

type PlatformLinkProps = {
  platform: Platform;
};

const iconMap = {
  spotify: FaSpotify,
  apple: FaApple,
  youtube: FaYoutube,
  rss: FaRss,
};

export function PlatformLink({ platform }: PlatformLinkProps) {
  const Icon = iconMap[platform.iconName];

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg sm:p-8"
    >
      <Icon className="h-10 w-10 text-text-muted transition-all duration-300 group-hover:scale-110 group-hover:text-brand sm:h-12 sm:w-12" />
      <span className="font-display text-sm font-semibold text-text-secondary transition-colors group-hover:text-text-primary">
        {platform.name}
      </span>
    </a>
  );
}
