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
      className="group flex flex-col items-center gap-2 rounded-lg p-4 transition-colors hover:bg-surface"
    >
      <Icon className="h-8 w-8 text-text-secondary transition-colors group-hover:text-brand" />
      <span className="text-sm text-text-secondary transition-colors group-hover:text-text-primary">
        {platform.name}
      </span>
    </a>
  );
}
