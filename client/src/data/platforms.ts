export type Platform = {
  id: string;
  name: string;
  url: string;
  iconName: 'spotify' | 'apple' | 'youtube' | 'rss';
};

export const platforms: Platform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://open.spotify.com/show/metalprogpopcast',
    iconName: 'spotify',
  },
  {
    id: 'apple',
    name: 'Apple Podcasts',
    url: 'https://podcasts.apple.com/podcast/metalprogpopcast',
    iconName: 'apple',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@metalprogpopcast',
    iconName: 'youtube',
  },
  {
    id: 'rss',
    name: 'RSS Feed',
    url: 'https://metalprogpop.com/feed.xml',
    iconName: 'rss',
  },
];
