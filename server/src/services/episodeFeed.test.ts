import { describe, expect, it, vi } from "vitest";
import { createEpisodeFeed } from "./episodeFeed.js";

const rss = (title: string) =>
  `<?xml version="1.0"?><rss><channel><title>${title}</title></channel></rss>`;

const ok = (body: string) => Promise.resolve(new Response(body));
const fail = () => Promise.resolve(new Response("nope", { status: 503 }));

describe("createEpisodeFeed", () => {
  it("serves the cached feed while fresh", async () => {
    const fetcher = vi.fn(() => ok(rss("A")));
    let time = 0;
    const getFeed = createEpisodeFeed(fetcher, () => time);

    expect(await getFeed()).toContain("A");
    time = 9 * 60 * 1000;
    expect(await getFeed()).toContain("A");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("refetches once the cache is stale", async () => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => ok(rss("A")))
      .mockImplementationOnce(() => ok(rss("B")));
    let time = 0;
    const getFeed = createEpisodeFeed(fetcher, () => time);

    await getFeed();
    time = 11 * 60 * 1000;
    expect(await getFeed()).toContain("B");
  });

  it("falls back to the last good copy when Audioboom fails", async () => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => ok(rss("A")))
      .mockImplementationOnce(fail);
    let time = 0;
    const getFeed = createEpisodeFeed(fetcher, () => time);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await getFeed();
    time = 11 * 60 * 1000;
    expect(await getFeed()).toContain("A");
  });

  it("fails without a cached copy, and on a non-RSS body", async () => {
    await expect(createEpisodeFeed(fail)()).rejects.toThrow("503");
    await expect(
      createEpisodeFeed(() => ok("<html></html>"))(),
    ).rejects.toThrow("not RSS");
  });

  it("shares one request between concurrent callers", async () => {
    const fetcher = vi.fn(() => ok(rss("A")));
    const getFeed = createEpisodeFeed(fetcher);

    await Promise.all([getFeed(), getFeed(), getFeed()]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
