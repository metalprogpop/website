// The podcast RSS feed, fetched from Audioboom server-side. The URL is fixed
// here, never taken from the request.
export const EPISODE_FEED_URL = "https://audioboom.com/channels/4940203.rss";

const FETCH_TIMEOUT_MS = 10 * 1000;

type FeedFetcher = (url: string, init: RequestInit) => Promise<Response>;

// Returns the feed XML, or throws if Audioboom fails or answers with
// something that is not RSS.
export const fetchEpisodeFeed = async (
  fetcher: FeedFetcher = fetch,
): Promise<string> => {
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
  return xml;
};
