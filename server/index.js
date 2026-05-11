const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/tracks', async (req, res) => {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = 'jsingh343';
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${apiKey}&format=json&limit=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.recenttracks.track);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});