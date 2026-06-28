const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{2,15}$/;
const VALID_PERIODS = ['7day', '1month', '3month', '6month', '12month', 'overall'];
const PERIOD_LABELS = {
  '7day':    'Last 7 days',
  '1month':  'Last month',
  '3month':  'Last 3 months',
  '6month':  'Last 6 months',
  '12month': 'Last 12 months',
  'overall': 'All time',
};

router.post('/', async (req, res) => {
  const { username, period } = req.body;

  if (!username || !USERNAME_PATTERN.test(username)) {
    return res.status(400).json({ error: 'A valid Last.fm username is required' });
  }
  if (!VALID_PERIODS.includes(period)) {
    return res.status(400).json({ error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` });
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(username)}&period=${period}&api_key=${apiKey}&format=json&limit=5`;

  let albums;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      return res.status(404).json({ error: data.message || 'Last.fm user not found' });
    }
    albums = data.topalbums.album;
  } catch {
    return res.status(500).json({ error: 'Failed to fetch albums from Last.fm' });
  }

  const albumLines = albums
    .map(a => `${a.name} — ${a.artist.name} — ${a.playcount} plays`)
    .join('\n');

  const prompt =
    `You are characterizing a listener's top albums for a given period.\n` +
    `Period: ${PERIOD_LABELS[period]}. Albums, most-played first:\n` +
    `${albumLines}.\n` +
    `Write a \`summary\` (3–5 sentences, plain prose, no markdown). Do not just restate the play counts — the user can already see those. Instead:\n` +
    `- Identify the through-line connecting the most-played albums (shared era, genre, sound, or artist lineage) and name the specific albums that justify it. If there is genuinely no common thread, say so plainly and describe the contrast — do not invent a theme.\n` +
    `- Interpret the shape of the play counts as listening behavior (one dominant obsession vs. evenly spread vs. a long tail), not just the raw numbers.\n` +
    `- You may include one non-obvious but factual observation connecting two or more albums (a shared producer, scene, or pivotal moment) — but only if you are confident it is true. If not, omit it.\n` +
    `Ground every claim in facts about the albums and artists, never in guesses about the listener's mood or emotional state.\n` +
    `Then write 5 \`recommendations\`, one per album as anchor: because they played X, suggest a different album Y, with a one-sentence reason. Return ONLY valid JSON, no markdown fences, no preamble, exactly:\n` +
    `{"summary": "...", "recommendations": [{"anchor":"Album by Artist","suggestion":"Album by Artist","reason":"..."}]}`;
    
  let message;
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }

  let rawText = message.content[0].text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.error('Report JSON parse failure:', rawText);
    return res.status(500).json({ error: 'Failed to parse report response' });
  }

  res.json(parsed);
});

module.exports = router;
