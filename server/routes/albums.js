const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = 'jsingh343';
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&period=7day&api_key=${apiKey}&format=json&limit=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.topalbums.album);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

module.exports = router;