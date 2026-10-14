import { describe, expect, it } from "vitest";
import type { FeedEpisode } from "./feed.js";
import { planSync } from "./sync.js";

const episode = (number: number): FeedEpisode => ({
  guid: `guid-${String(number)}`,
  number,
  slug: `album-${String(number)}`,
  title: `Album ${String(number)} - Band`,
  album: `Album ${String(number)}`,
  band: "Band",
  genre: null,
  descriptionHtml: "",
  descriptionText: "",
  audioUrl: "https://audioboom.com/posts/1.mp3",
  artworkUrl: "https://audioboom.com/i/1.png",
  audioboomUrl: "https://audioboom.com/posts/1",
  durationSeconds: 60,
  publishedAt: new Date("2026-01-01T00:00:00Z"),
});

// The feed lists the newest episode first.
const feed = (...numbers: number[]) => numbers.map(episode);

const numbers = (episodes: FeedEpisode[]) => episodes.map((e) => e.number);

describe("planSync", () => {
  it("refreshes only the three newest episodes when nothing is missing", () => {
    const stored = [10, 9, 8, 7, 6].map((number) => ({
      number,
      hidden: false,
    }));

    const plan = planSync(stored, feed(10, 9, 8, 7, 6), "recent");

    expect(numbers(plan.upsert)).toEqual([10, 9, 8]);
    expect(plan.hide).toEqual([]);
  });

  it("also adds episodes that are not stored yet", () => {
    const stored = [9, 8, 7].map((number) => ({ number, hidden: false }));

    const plan = planSync(stored, feed(11, 10, 9, 8, 7, 3), "recent");

    expect(numbers(plan.upsert)).toEqual([11, 10, 9, 3]);
  });

  it("stores everything on a full re-sync and hides what left the feed", () => {
    const stored = [
      { number: 5, hidden: false },
      { number: 4, hidden: false },
      { number: 3, hidden: true },
      { number: 2, hidden: false },
    ];

    const plan = planSync(stored, feed(5, 4, 1), "full");

    expect(numbers(plan.upsert)).toEqual([5, 4, 1]);
    expect(plan.hide).toEqual([2]);
  });

  it("never hides anything on the hourly sync", () => {
    const stored = [{ number: 2, hidden: false }];

    expect(planSync(stored, feed(5, 4, 1), "recent").hide).toEqual([]);
  });
});
