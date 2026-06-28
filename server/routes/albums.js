const express = require('express');
const router = express.Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{2,15}$/;
const VALID_PERIODS = ['7day', '1month', '3month', '6month', '12month', 'overall'];

router.get('/', async (req, res) => {
  const username = req.query.username;
  const period = req.query.period || '7day';

  if (!username || !USERNAME_PATTERN.test(username)) {
    return res.status(400).json({ error: 'A valid Last.fm username is required' });
  }

  if (!VALID_PERIODS.includes(period)) {
    return res.status(400).json({ error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` });
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(username)}&period=${period}&api_key=${apiKey}&format=json&limit=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ error: data.message || 'Last.fm user not found' });
    }

    res.json(data.topalbums.album);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

module.exports = router;