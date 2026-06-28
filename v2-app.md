# Music Context App — v2 Scope: Reports Page

## Goal

Add a reports page that turns a user's listening history into a narrative. For a selected time period, generate (1) an AI-written context report characterizing the period's albums using play counts, and (2) a small set of per-anchor album recommendations grounded in the user's most-played albums.

This is the feature that differentiates the app from Last.fm: Last.fm shows you the numbers; this turns them into a story and points you somewhere new.

---

## What v2 Adds

### 1. Period selector
- Pull top albums via `user.getTopAlbums` with a `period` parameter.
- Supported periods: `7day`, `1month`, `3month`, `6month`, `12month`.
- Limit to **10 albums** per period (tighter list = more characterful report and cleaner recommendation anchors).

### 2. Context report
- An AI-generated summary characterizing the period's listening.
- Uses **play counts** (already in the `getTopAlbums` response) as the concrete anchor — references actual numbers rather than vague impressions.
- Handles heterogeneity by *characterizing the spread*, not forcing false coherence. Names the "main character" album (most-played) and describes the range around it.
- Single Claude call; relies on the model already recognizing named albums for genre/era context.

### 3. Per-anchor recommendations
- Use the **top 2–3 most-played albums** as anchors.
- One recommendation per anchor: "because you played X, try Y."
- Per-anchor framing (not averaging across the whole list) keeps each recommendation grounded in a single coherent seed, makes the connection legible to the user, and surfaces bad recs instead of burying them.

---

## Implementation Notes

- **One `getTopAlbums` call + one Claude call** per report. The Claude call can return JSON with both the summary and recommendations: `{ summary, recommendations }`. Split into two prompts only if one prompt doing two jobs dilutes either.
- **Stateless** — no database, no auth required for v2. The report regenerates on demand.
- **UI:** Build recommendations as paired "X → Y" cards. This matches the v3 structure (where an algorithm replaces the model's guess for Y), so v3 becomes a backend swap rather than a UI redesign.

---

## Known Limitation (and the v3 value prop)

In v2, the model *guesses* the recommended album. It may occasionally name an album that doesn't fit its stated anchor, or rarely one that doesn't exist. The per-anchor framing surfaces these rather than hiding them — that's the best achievable before a grounding layer.

v3 fixes this by generating recommendations from the Last.fm similarity graph (artist.getSimilar + tags), ranking them algorithmically, and using the LLM only to explain *why*. See `V3-RECOMMENDATION-ARCHITECTURE.md`.

---

## Out of Scope for v2

- RAG / vector store / embeddings (v3, or its own project)
- Algorithmic recommendation engine — graph traversal, scoring, diversity logic (v3)
- Manual album input for recommendations (dilutes the "your history is the anchor" differentiator)
- Supabase Auth and persistent user data (added only when a feature genuinely needs it — e.g. v3 caching)
- Caching AI-generated reports or recommendations
- MusicBrainz enrichment (release dates, labels)
- Genre/tag display from `album.getInfo` (only revisit if the report gets thin on obscure listening)

---

## Success Criteria

- User can select a time period and see their top 10 albums for it.
- User can generate a context report that references real play counts and characterizes the period honestly, contrasts included.
- User can see 2–3 per-anchor recommendations, each tied to a named album they actually played.
- The whole report comes from one `getTopAlbums` call and one Claude call, no new infrastructure.