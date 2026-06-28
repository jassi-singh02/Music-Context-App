const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const albumsRouter = require('./routes/albums');
const contextRouter = require('./routes/context');
const reportRouter = require('./routes/report');

app.use('/api/albums', albumsRouter);
app.use('/api/context', contextRouter);
app.use('/api/report', reportRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve the React client build in production
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Catch-all: any request that didn't match an API route gets index.html
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});