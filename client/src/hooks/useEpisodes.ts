import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import type { Episode } from 'shared';

const RSS_URL = 'https://audioboom.com/channels/4940203.rss';
const CORS_PROXY = 'https://corsproxy.io/?';
const PAGE_SIZE = 15;

function parseRssToEpisodes(xml: string): Episode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');

  return Array.from(items).map((item) => {
    const title = item.querySelector('title')?.textContent ?? '';
    const episodeNumber = item.getElementsByTagName('itunes:episode')[0]?.textContent;
    const duration = item.getElementsByTagName('itunes:duration')[0]?.textContent;
    const image = item.getElementsByTagName('itunes:image')[0]?.getAttribute('href');
    const description = item.querySelector('description')?.textContent ?? '';
    const pubDate = item.querySelector('pubDate')?.textContent ?? '';
    const link = item.querySelector('link')?.textContent ?? '';
    const guid = item.querySelector('guid')?.textContent ?? '';

    // Strip HTML tags from description
    const cleanDescription = description.replace(/<[^>]*>/g, '').trim();

    return {
      id: guid || link,
      spotifyEpisodeId: undefined,
      title,
      description: cleanDescription,
      episodeNumber: episodeNumber ? parseInt(episodeNumber, 10) : undefined,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      durationSeconds: duration ? parseInt(duration, 10) : 0,
      artworkUrl: image ?? '',
      spotifyUrl: link,
    };
  });
}

async function fetchEpisodes(): Promise<Episode[]> {
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(RSS_URL)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch episodes');
  }

  const xml = await response.text();
  return parseRssToEpisodes(xml);
}

export function useEpisodes() {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const query = useQuery({
    queryKey: ['episodes'],
    queryFn: fetchEpisodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const episodes = useMemo(
    () => query.data?.slice(0, displayCount) ?? [],
    [query.data, displayCount]
  );

  const hasMore = (query.data?.length ?? 0) > displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  };

  return {
    episodes,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore,
    loadMore,
    total: query.data?.length ?? 0,
  };
}
