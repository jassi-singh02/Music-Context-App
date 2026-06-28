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
          content: `In 2–4 sentences, give context for "${album}" by ${artist}: the genre it belongs to and how it sits within it, any notable background or significance, and one specific musically interesting detail. Plain prose only — no markdown, no bold, no italics, no lists. Be concrete and specific; avoid generic praise like "influential" or "groundbreaking" unless you say exactly why.`
        }
      ]
    });

    res.json({ context: message.content[0].text });
  } catch (error) {
    console.error(error);   // the real message lands here
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

module.exports = router;