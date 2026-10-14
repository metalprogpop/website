import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import type { Genre } from "shared";

// An episode as read from the Audioboom RSS feed, before it is stored.
export type FeedEpisode = {
  guid: string;
  number: number;
  slug: string;
  title: string;
  album: string;
  band: string | null;
  genre: Genre | null;
  descriptionHtml: string;
  descriptionText: string;
  audioUrl: string;
  artworkUrl: string;
  audioboomUrl: string;
  durationSeconds: number;
  publishedAt: Date;
};

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

const toEpisode = (raw: z.infer<typeof itemSchema>): FeedEpisode => {
  // Unnumbered items have no itunes:title; their plain title has no
  // "<number>: " prefix to strip either.
  const title = collapseWhitespace(
    raw["itunes:title"] ?? raw.title.replace(/^\d+:\s*/, ""),
  );
  const number = raw["itunes:episode"]
    ? parseInt(raw["itunes:episode"], 10)
    : 0;
  const description = raw.description ?? "";
  return {
    guid: typeof raw.guid === "string" ? raw.guid : raw.guid["#text"],
    number,
    slug: slugify(title),
    title,
    ...splitTitle(title),
    genre: genreOf(number),
    descriptionHtml: sanitizeDescription(description),
    descriptionText: toPlainText(description),
    audioUrl: raw.enclosure["@_url"],
    artworkUrl: raw["itunes:image"]["@_href"],
    audioboomUrl: raw.link,
    durationSeconds: parseInt(raw["itunes:duration"], 10),
    publishedAt: new Date(raw.pubDate),
  };
};

// Parses the podcast RSS feed into episodes, newest first as published. An
// item that cannot be read is skipped rather than failing the whole feed. The
// number identifies an episode on the site, so when two items share one, only
// the newest is kept.
export const parseFeed = (xml: string): FeedEpisode[] => {
  const feed = feedSchema.parse(parser.parse(xml));
  const seen = new Set<number>();
  const episodes: FeedEpisode[] = [];
  for (const item of feed.rss.channel.item) {
    const parsed = itemSchema.safeParse(item);
    if (!parsed.success) {
      console.warn("Skipping unreadable feed item:", parsed.error.issues);
      continue;
    }
    const episode = toEpisode(parsed.data);
    if (!seen.has(episode.number)) {
      seen.add(episode.number);
      episodes.push(episode);
    }
  }
  return episodes;
};
