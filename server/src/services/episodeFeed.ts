// The podcast RSS feed, fetched from Audioboom server-side (it sends no CORS
// headers, so browsers cannot read it directly) and kept in memory. The URL
// is fixed here, never taken from the request.
export const EPISODE_FEED_URL = "https://audioboom.com/channels/4940203.rss";

const FRESH_FOR_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10 * 1000;

type CachedFeed = { xml: string; fetchedAt: number };

type FeedFetcher = (url: string, init: RequestInit) => Promise<Response>;

// Returns the feed XML. A cached copy is served while fresh; after that the
// feed is refetched, and if Audioboom fails the last good copy is served
// rather than an error. Concurrent refreshes share one request.
export const createEpisodeFeed = (
  fetcher: FeedFetcher = fetch,
  now: () => number = Date.now,
) => {
  let cached: CachedFeed | null = null;
  let inFlight: Promise<string> | null = null;

  const refresh = async (): Promise<string> => {
    const res = await fetcher(EPISODE_FEED_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Episode feed returned ${String(res.status)}`);
    }
    const xml = await res.text();
    if (!xml.includes("<rss")) {
      throw new Error("Episode feed is not RSS");
    }
    cached = { xml, fetchedAt: now() };
    return xml;
  };

  return async (): Promise<string> => {
    if (cached && now() - cached.fetchedAt < FRESH_FOR_MS) {
      return cached.xml;
    }
    inFlight ??= refresh().finally(() => {
      inFlight = null;
    });
    try {
      return await inFlight;
    } catch (err) {
      if (cached) {
        console.error("Serving stale episode feed:", err);
        return cached.xml;
      }
      throw err;
    }
  };
};

export const getEpisodeFeed = createEpisodeFeed();
