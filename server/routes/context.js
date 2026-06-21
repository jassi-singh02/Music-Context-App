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
          content: `Give me context for "${album}" by ${artist}. Use critic and online reviews of the album to describe what genre it belongs to and how it fits in, describe any background or significance to the album, and describe what makes it musically interesting. Keep it to 3 short paragraphs. Do not use any markdown formatting — no
          bold, no italics, no bullet points. Plain prose only.`
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