import { describe, expect, it } from "vitest";
import { fetchEpisodeFeed } from "./episodeFeed.js";

const ok = (body: string) => () => Promise.resolve(new Response(body));

describe("fetchEpisodeFeed", () => {
  it("returns the feed XML", async () => {
    const xml = '<?xml version="1.0"?><rss><channel></channel></rss>';

    expect(await fetchEpisodeFeed(ok(xml))).toBe(xml);
  });

  it("fails when Audioboom fails or answers with something else", async () => {
    await expect(
      fetchEpisodeFeed(() =>
        Promise.resolve(new Response("nope", { status: 503 })),
      ),
    ).rejects.toThrow("503");
    await expect(fetchEpisodeFeed(ok("<html></html>"))).rejects.toThrow(
      "not RSS",
    );
  });
});
