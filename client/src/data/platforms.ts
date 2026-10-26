export type Platform = {
  id: string;
  name: string;
  url: string;
  iconName: 'spotify' | 'apple' | 'audioboom';
};

// Checked by hand: every link opens the podcast's page on that platform.
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
    id: 'audioboom',
    name: 'Audioboom',
    url: 'https://audioboom.com/channels/4940203',
    iconName: 'audioboom',
  },
];
