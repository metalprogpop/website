import { vi } from "vitest";
import type { FanClubProgram, Genre, VideoEpisode } from "shared";

// Invented catalog for client tests. Program N's part k is episode
// 3 × (N − 1) + k, with genres cycling metal, prog, pop.
const GENRES: Genre[] = ["metal", "prog", "pop"];

export const videoEpisode = (number: number): VideoEpisode => ({
  number,
  slug: `disco-${String(number)}`,
  title: `Disco ${String(number)} - Banda ${String(number)}`,
  album: `Disco ${String(number)}`,
  band: `Banda ${String(number)}`,
  genre: GENRES[(number - 1) % 3] ?? null,
  artworkUrl: `https://audioboom.com/i/${String(number)}.jpg`,
  publishedAt: new Date(Date.UTC(2025, 0, number)).toISOString(),
});

export const videoProgram = (
  number: number,
  missingParts: number[] = [],
): FanClubProgram => {
  const parts = [1, 2, 3].map((part) => ({
    part,
    missing: missingParts.includes(part),
    episodes: [videoEpisode(3 * (number - 1) + part)],
  }));
  return {
    number,
    publishedAt: parts[2]?.episodes[0]?.publishedAt ?? null,
    parts,
  };
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

type Routes = Record<string, () => Response>;

// Answers each request by the first route whose path is in its URL (list
// longer paths first), so parallel requests can arrive in any order.
export function mockApi(routes: Routes) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const route = Object.entries(routes).find(([path]) => url.includes(path));
    if (!route) {
      return Promise.reject(new Error(`Unmocked request: ${url}`));
    }
    return Promise.resolve(route[1]());
  });
}
