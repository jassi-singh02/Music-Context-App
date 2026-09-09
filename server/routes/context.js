const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_FIELD_LENGTH = 200;

// In-memory cache of successful context responses, keyed by artist + album.
// Lives for the lifetime of the process; capped so it can't grow unbounded.
const CACHE_MAX_ENTRIES = 500;
const contextCache = new Map();

function cacheKey(artist, album) {
  return `${artist.toLowerCase()}::${album.toLowerCase()}`;
}

function remember(key, value) {
  if (contextCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = contextCache.keys().next().value;
    contextCache.delete(oldest);
  }
  contextCache.set(key, value);
}

function readField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.get('/', async (req, res) => {
  const artist = readField(req.query.artist);
  const album = readField(req.query.album);

  if (!artist || !album) {
    return res.status(400).json({ error: 'Both artist and album are required' });
  }
  if (artist.length > MAX_FIELD_LENGTH || album.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ error: `artist and album must be ${MAX_FIELD_LENGTH} characters or fewer` });
  }

  const key = cacheKey(artist, album);
  if (contextCache.has(key)) {
    return res.json(contextCache.get(key));
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Give context for "${album}" by ${artist}. In the "context" field: 2–4 sentences of plain prose (no markdown, no bold, no italics, no lists) covering the genre and how this album sits within it, any notable background or significance, and one specific musically interesting detail. Be concrete; avoid generic praise like "influential" unless you say exactly why. In the "recommendation" field: one album (not "${album}" itself) that a fan of this album would likely enjoy, with a one-sentence reason tying it specifically to this album. Return ONLY valid JSON, no markdown fences, no preamble, exactly: {"context":"...","recommendation":{"suggestion":"Album by Artist","reason":"..."}}`
        }
      ]
    });

    let rawText = message.content[0].text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error('Context JSON parse failure:', rawText);
      // Don't cache a malformed response; a retry may parse cleanly.
      return res.json({ context: rawText });
    }

    remember(key, parsed);
    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

module.exports = router;
