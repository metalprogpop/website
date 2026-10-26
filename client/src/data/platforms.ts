export type Platform = {
  id: string;
  name: string;
  url: string;
  iconName: 'spotify' | 'apple' | 'youtube' | 'rss';
};

// Checked by hand: every link opens the podcast's page on that platform.
// YouTube is left out until the podcast has a channel there.
export const platforms: Platform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://open.spotify.com/show/4QlRgUm2JiY71meg8UGpDm',
    iconName: 'spotify',
  },
  {
    id: 'apple',
    name: 'Apple Podcasts',
    url: 'https://podcasts.apple.com/us/podcast/metalprogpop-cast/id1329301095',
    iconName: 'apple',
  },
  {
    id: 'rss',
    name: 'RSS Feed',
    // The podcast's own feed, as published by Audioboom.
    url: 'https://audioboom.com/channels/4940203.rss',
    iconName: 'rss',
  },
];
