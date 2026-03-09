import { describe, it, expect } from 'vitest'
import { parseRssToEpisodes } from '../hooks/useEpisodes'

const makeRss = (items: string) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>${items}</channel>
</rss>`

const sampleItem = `
<item>
  <title>Episode Title</title>
  <guid>ep-123</guid>
  <link>https://example.com/ep-123</link>
  <description>&lt;p&gt;Some &lt;b&gt;HTML&lt;/b&gt; description&lt;/p&gt;</description>
  <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
  <itunes:episode>42</itunes:episode>
  <itunes:duration>3600</itunes:duration>
  <itunes:image href="https://example.com/art.jpg" />
</item>`

describe('parseRssToEpisodes', () => {
  it('parses a valid RSS item into an Episode', () => {
    const episodes = parseRssToEpisodes(makeRss(sampleItem))

    expect(episodes).toHaveLength(1)
    expect(episodes[0]).toMatchObject({
      id: 'ep-123',
      title: 'Episode Title',
      episodeNumber: 42,
      durationSeconds: 3600,
      artworkUrl: 'https://example.com/art.jpg',
      spotifyUrl: 'https://example.com/ep-123',
    })
  })

  it('strips HTML tags from description', () => {
    const episodes = parseRssToEpisodes(makeRss(sampleItem))
    expect(episodes[0].description).toBe('Some HTML description')
  })

  it('parses publishedAt as ISO string', () => {
    const episodes = parseRssToEpisodes(makeRss(sampleItem))
    expect(episodes[0].publishedAt).toBe('2024-01-01T00:00:00.000Z')
  })

  it('returns empty array for empty feed', () => {
    const episodes = parseRssToEpisodes(makeRss(''))
    expect(episodes).toEqual([])
  })

  it('handles missing optional fields', () => {
    const minimalItem = `
    <item>
      <title>Minimal</title>
      <guid>min-1</guid>
      <link></link>
      <description></description>
      <pubDate></pubDate>
    </item>`

    const episodes = parseRssToEpisodes(makeRss(minimalItem))

    expect(episodes).toHaveLength(1)
    expect(episodes[0].title).toBe('Minimal')
    expect(episodes[0].episodeNumber).toBeUndefined()
    expect(episodes[0].durationSeconds).toBe(0)
    expect(episodes[0].artworkUrl).toBe('')
  })
})
