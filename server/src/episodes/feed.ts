import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { genreSchema, type Genre } from "shared";

// An episode as read from the Audioboom RSS feed, before it is stored. The
// values are checked here so that one malformed item is skipped instead of
// failing the database write or the client's validation of the whole list.
const feedEpisodeSchema = z.object({
  guid: z.string().min(1),
  number: z.number().int().nonnegative(),
  slug: z.string().min(1),
  title: z.string().min(1),
  album: z.string().min(1),
  band: z.string().nullable(),
  genre: genreSchema.nullable(),
  descriptionHtml: z.string(),
  descriptionText: z.string(),
  audioUrl: z.string().url(),
  artworkUrl: z.string().url(),
  audioboomUrl: z.string().url(),
  durationSeconds: z.number().int().nonnegative(),
  publishedAt: z.date(),
});

export type FeedEpisode = z.infer<typeof feedEpisodeSchema>;

const GENRES: readonly Genre[] = ["metal", "prog", "pop"];

const itemSchema = z.object({
  guid: z.union([z.string(), z.object({ "#text": z.string() })]),
  title: z.string(),
  "itunes:title": z.string().optional(),
  "itunes:episode": z.string().optional(),
  "itunes:duration": z.string(),
  "itunes:image": z.object({ "@_href": z.string() }),
  enclosure: z.object({ "@_url": z.string() }),
  link: z.string(),
  description: z.string().optional(),
  pubDate: z.string(),
});

const feedSchema = z.object({
  rss: z.object({
    channel: z.object({ item: z.array(z.unknown()).default([]) }),
  }),
});

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (name) => name === "item",
});

export const genreOf = (number: number): Genre | null =>
  number > 0 ? (GENRES[(number - 1) % GENRES.length] ?? null) : null;

export const slugify = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const collapseWhitespace = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

// Titles read "Album - Band". The band follows the last dash that has a space
// on at least one side ("Dirt -Alice in Chains" happens); a dash inside a word
// ("Alive-Live") is part of the name.
const splitTitle = (title: string): { album: string; band: string | null } => {
  const separators = [...title.matchAll(/\s+-\s*|\s*-\s+/g)];
  const last = separators.at(-1);
  if (!last) {
    return { album: title, band: null };
  }
  return {
    album: title.slice(0, last.index).trim(),
    band: title.slice(last.index + last[0].length).trim(),
  };
};

const sanitizeDescription = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  }).trim();

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const toPlainText = (html: string): string =>
  collapseWhitespace(
    sanitizeHtml(html.replace(/<\/(p|div|li)>|<br\s*\/?>/gi, " "), {
      allowedTags: [],
      allowedAttributes: {},
    }).replace(
      /&(amp|lt|gt|quot|#39|nbsp);/g,
      (entity) => ENTITIES[entity] ?? entity,
    ),
  );

// itunes:duration is seconds, or h:mm:ss / mm:ss. Anything else is NaN and
// fails validation.
const parseDuration = (text: string): number => {
  const parts = text.trim().split(":");
  if (parts.some((part) => !/^\d+$/.test(part)) || parts.length > 3) {
    return Number.NaN;
  }
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
};

// number is null for unnumbered items; parseFeed decides what they become.
const toCandidate = (
  raw: z.infer<typeof itemSchema>,
): Omit<FeedEpisode, "number" | "genre"> & { number: number | null } => {
  // Unnumbered items have no itunes:title; their plain title has no
  // "<number>: " prefix to strip either.
  const title = collapseWhitespace(
    raw["itunes:title"] ?? raw.title.replace(/^\d+:\s*/, ""),
  );
  const number = raw["itunes:episode"] ? Number(raw["itunes:episode"]) : null;
  const description = raw.description ?? "";
  return {
    guid: typeof raw.guid === "string" ? raw.guid : raw.guid["#text"],
    number,
    slug: slugify(title),
    title,
    ...splitTitle(title),
    descriptionHtml: sanitizeDescription(description),
    descriptionText: toPlainText(description),
    audioUrl: raw.enclosure["@_url"],
    artworkUrl: raw["itunes:image"]["@_href"],
    audioboomUrl: raw.link,
    durationSeconds: parseDuration(raw["itunes:duration"]),
    publishedAt: new Date(raw.pubDate),
  };
};

// Parses the podcast RSS feed into episodes, newest first as published. An
// item that cannot be read is skipped rather than failing the whole feed.
//
// The number identifies an episode on the site, so when two items share one
// only the newest is kept. Unnumbered items have no address: the oldest one
// (the 2017 presentation) is episode 0 and any later ones are skipped, so a
// new unnumbered bonus never takes over the presentation's page.
export const parseFeed = (xml: string): FeedEpisode[] => {
  const feed = feedSchema.parse(parser.parse(xml));
  const candidates = feed.rss.channel.item.flatMap((item) => {
    const parsed = itemSchema.safeParse(item);
    if (!parsed.success) {
      console.warn("Skipping unreadable feed item:", parsed.error.issues);
      return [];
    }
    return [toCandidate(parsed.data)];
  });
  const presentation = [...candidates]
    .reverse()
    .find((candidate) => candidate.number === null);

  const seen = new Set<number>();
  const episodes: FeedEpisode[] = [];
  for (const candidate of candidates) {
    if (candidate.number === null && candidate !== presentation) {
      console.warn(`Skipping unnumbered feed item: ${candidate.title}`);
      continue;
    }
    const number = candidate.number ?? 0;
    const episode = feedEpisodeSchema.safeParse({
      ...candidate,
      number,
      genre: genreOf(number),
    });
    if (!episode.success) {
      console.warn(
        `Skipping invalid feed item ${candidate.title}:`,
        episode.error.issues,
      );
      continue;
    }
    if (!seen.has(number)) {
      seen.add(number);
      episodes.push(episode.data);
    }
  }
  return episodes;
};
