const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.get('/', async (req, res) => {
  const { artist, track } = req.query;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Give me historical and musical context for "${track}" by ${artist}. Cover the era it came from, its cultural significance, and what makes it musically interesting. Keep it to 3 short paragraphs.`
        }
      ]
    });

    res.json({ context: message.content[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

module.exports = router;