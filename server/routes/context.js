const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.get('/', async (req, res) => {
  const { artist, album } = req.query;

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
      return res.json({ context: rawText });
    }

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

module.exports = router;
