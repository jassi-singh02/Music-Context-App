const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const albumsRouter = require('./routes/albums');
const contextRouter = require('./routes/context');

app.use('/api/albums', albumsRouter);
app.use('/api/context', contextRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});