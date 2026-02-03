import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Episode } from 'shared';
import { Container } from '../components/layout/Container';
import { EpisodeCard } from '../components/landing/EpisodeCard';
import { Logo } from '../components/ui/Logo';

const RSS_URL = 'https://audioboom.com/channels/4940203.rss';
const CORS_PROXY = 'https://corsproxy.io/?';

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

export function EpisodesPage() {
  const [search, setSearch] = useState('');

  const { data: episodes, isLoading, isError } = useQuery({
    queryKey: ['episodes'],
    queryFn: fetchEpisodes,
    staleTime: 5 * 60 * 1000,
  });

  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    if (!search.trim()) return episodes;

    const searchLower = search.toLowerCase();
    return episodes.filter((episode) =>
      episode.title.toLowerCase().includes(searchLower)
    );
  }, [episodes, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link to="/">
              <Logo size="sm" />
            </Link>
          </div>
        </Container>
      </header>

      <main className="py-12">
        <Container>
          <div className="mb-8">
            <h1 className="mb-2 font-display text-3xl font-bold text-text-primary sm:text-4xl">
              Todos los Episodios
            </h1>
            <p className="text-text-secondary">
              {episodes?.length ?? 0} episodios disponibles
            </p>
          </div>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar episodios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:max-w-md"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="py-12 text-center text-text-secondary">
              Error al cargar los episodios. Por favor, intenta de nuevo más tarde.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {filteredEpisodes.length === 0 ? (
                <div className="py-12 text-center text-text-secondary">
                  No se encontraron episodios que coincidan con "{search}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEpisodes.map((episode) => (
                    <EpisodeCard key={episode.id} episode={episode} />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </main>
    </div>
  );
}
