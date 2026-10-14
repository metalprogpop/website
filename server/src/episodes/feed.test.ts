import { describe, expect, it } from "vitest";
import { parseFeed } from "./feed.js";

type ItemFields = {
  title: string;
  number?: number;
  guid?: string;
  description?: string;
  // The 2017 presentation, like any unnumbered item, has no itunes:title.
  itunesTitle?: boolean;
};

// Shaped like Audioboom's real feed for channel 4940203.
const item = ({
  title,
  number,
  guid,
  description,
  itunesTitle = true,
}: ItemFields) => `
<item>
  <title>${number === undefined ? title : `${String(number)}: ${title}`}</title>
  <link>https://audioboom.com/posts/8946874</link>
  ${number === undefined ? "" : `<itunes:episode>${String(number)}</itunes:episode>`}
  ${itunesTitle ? `<itunes:title>${title}</itunes:title>` : ""}
  <enclosure url="https://audioboom.com/posts/8946874.mp3?modified=1788042675&amp;sid=4940203&amp;source=rss" length="123898997" type="audio/mpeg" />
  <itunes:image href="https://audioboom.com/i/43814774.png" />
  <itunes:duration>7689</itunes:duration>
  <description><![CDATA[${description ?? "<p>Un disco.</p>"}]]></description>
  <pubDate>Sat, 29 Aug 2026 22:26:31 +0000</pubDate>
  <guid isPermaLink="false">${guid ?? `audioboom-${title}`}</guid>
</item>`;

const rss = (...items: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel><title>MetalProgPop Cast</title>${items.join("")}</channel>
</rss>`;

describe("parseFeed", () => {
  it("turns an item into an episode", () => {
    const [episode] = parseFeed(
      rss(
        item({
          title: "La dicha en movimiento - Los Twist",
          number: 291,
          guid: "audioboom-01a04fa3",
        }),
      ),
    );

    expect(episode).toEqual({
      guid: "audioboom-01a04fa3",
      number: 291,
      slug: "la-dicha-en-movimiento-los-twist",
      title: "La dicha en movimiento - Los Twist",
      album: "La dicha en movimiento",
      band: "Los Twist",
      genre: "pop",
      descriptionHtml: "<p>Un disco.</p>",
      descriptionText: "Un disco.",
      audioUrl:
        "https://audioboom.com/posts/8946874.mp3?modified=1788042675&sid=4940203&source=rss",
      artworkUrl: "https://audioboom.com/i/43814774.png",
      audioboomUrl: "https://audioboom.com/posts/8946874",
      durationSeconds: 7689,
      publishedAt: new Date("2026-08-29T22:26:31Z"),
    });
  });

  it("keeps only safe formatting in the description", () => {
    const episode = parseFeed(
      rss(
        item({
          title: "Fragile - Yes",
          number: 14,
          description:
            '<div><p><strong>Fragile</strong> &amp; <em>más</em></p><script>alert(1)</script><p>Ver <a href="https://yes.com" onclick="x()">acá</a> y <a href="javascript:alert(1)">no</a></p></div>',
        }),
      ),
    ).at(0);

    expect(episode?.descriptionHtml).toBe(
      '<p><strong>Fragile</strong> &amp; <em>más</em></p><p>Ver <a href="https://yes.com" target="_blank" rel="noopener noreferrer">acá</a> y <a target="_blank" rel="noopener noreferrer">no</a></p>',
    );
    expect(episode?.descriptionText).toBe("Fragile & más Ver acá y no");
  });

  it("gives the unnumbered presentation number 0 and no genre or band", () => {
    const [episode] = parseFeed(
      rss(
        item({ title: "Presentación de nuestro Podcast", itunesTitle: false }),
      ),
    );

    expect(episode).toMatchObject({
      number: 0,
      slug: "presentacion-de-nuestro-podcast",
      album: "Presentación de nuestro Podcast",
      band: null,
      genre: null,
    });
  });

  it("cleans up spacing, entities and accents in titles", () => {
    const episodes = parseFeed(
      rss(
        item({ title: "Un  paso más en la batalla - V8", number: 289 }),
        item({ title: "Overkill -  Motörhead ", number: 7 }),
        item({ title: "Trilogy - Emerson Lake &amp; Palmer", number: 5 }),
        item({ title: "Dirt -Alice in Chains", number: 34 }),
        item({ title: "Alive-Live - Ex-Band", number: 40 }),
        item({ title: "She's So Unusual - Cyndi Lauper", number: 288 }),
      ),
    );

    expect(
      episodes.map(({ slug, album, band, genre }) => ({
        slug,
        album,
        band,
        genre,
      })),
    ).toEqual([
      {
        slug: "un-paso-mas-en-la-batalla-v8",
        album: "Un paso más en la batalla",
        band: "V8",
        genre: "metal",
      },
      {
        slug: "overkill-motorhead",
        album: "Overkill",
        band: "Motörhead",
        genre: "metal",
      },
      {
        slug: "trilogy-emerson-lake-palmer",
        album: "Trilogy",
        band: "Emerson Lake & Palmer",
        genre: "prog",
      },
      {
        slug: "dirt-alice-in-chains",
        album: "Dirt",
        band: "Alice in Chains",
        genre: "metal",
      },
      {
        slug: "alive-live-ex-band",
        album: "Alive-Live",
        band: "Ex-Band",
        genre: "metal",
      },
      {
        slug: "shes-so-unusual-cyndi-lauper",
        album: "She's So Unusual",
        band: "Cyndi Lauper",
        genre: "pop",
      },
    ]);
  });

  it("skips items it cannot read instead of failing the whole feed", () => {
    const episodes = parseFeed(
      rss(
        "<item><title>Roto</title></item>",
        item({ title: "Holy Diver - DIO", number: 13 }),
      ),
    );

    expect(episodes.map((episode) => episode.number)).toEqual([13]);
  });

  it("keeps the newest item when two share a number", () => {
    const episodes = parseFeed(
      rss(
        item({ title: "Rio - Duran Duran", number: 3, guid: "newer" }),
        item({ title: "Rio - Duran Duran", number: 3, guid: "older" }),
      ),
    );

    expect(episodes.map((episode) => episode.guid)).toEqual(["newer"]);
  });
});
