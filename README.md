# Music Context App

This app pulls your top albums from Last.fm and uses Claude to explain what you're actually listening to using the genre placement, historical context, a specific musical detail per album, plus recommendations grounded in your listening patterns.

**[Live demo](https://music-context-app-production.up.railway.app/)** · you don't have to signup, just enter any public Last.fm username. My Last.fm is set as default

## What it does

- Fetches your top 10 albums across six time periods (weekly → all-time)
- Expands any album for AI-written context and a related album recommendation
- Generates a listening report that identifies a through-line across your top 5 and suggests albums that extend it

The AI layer is built around factual grounding. The prompts ask for concrete detail over generic praise, and it's forbidden from speculating about the listener's mood or restating play counts back at them.

## Stack

React 19 + Vite · Express 5 · Last.fm API · Anthropic Claude (Sonnet 4.6) · Railway

There's no database yet, the app is stateless and reads public Last.fm data. The Anthropic key lives server-side only; the client never sees it.

## Running locally

It needs a [Last.fm API key](https://www.last.fm/api/account/create) and an [Anthropic API key](https://console.anthropic.com/) in `server/.env`:

```
LASTFM_API_KEY=...
ANTHROPIC_API_KEY=...
```

Then `npm install && npm run dev` in `server/` (:3001) and `client/` (:5173). Vite proxies `/api` to the server.

## What's Next

I am currently working on

- Resolving AI recommendations against the Deezer API so suggestions point at real releases rather than model recall
- Caching context responses — every expand is currently a fresh Claude call
- Creating algorithmic recommendation layer using Last.fm's similarity graph, with the LLM used only for explanation
- A database to store reports, contexts, and recommendations