# Music Context App — Project Brief

A platform that takes your recent music history and provides historical and musical context to each song.

---

## MVP Success Criteria

- User can enter their Last.fm username and see their top 10 recent tracks
- User can click a track and read AI-generated historical/musical context
- User can refresh to pull a new top 10
- User can create an account so their Last.fm username is saved for next time

---

## Core Loop

```
Enter Last.fm username → See top 10 recent tracks → Click track → Read context
```

---

## Skeleton Milestones

1. React/Vite frontend + Express backend running locally, talking to each other
2. Last.fm `user.getRecentTracks` returns data to the frontend (hardcode a username)
3. Click a track → OpenAI returns context, rendered on screen
4. UI is usable enough to demo
5. Deployed to Railway with a public link
6. Supabase Auth added — email/password login, Last.fm username saved to DB

---

## Tech Stack

| Layer      | Choice              |
|------------|---------------------|
| Frontend   | React + Vite        |
| Backend    | Node.js + Express   |
| Database   | PostgreSQL          |
| Auth       | Supabase Auth       |
| AI         | OpenAI API          |
| Data       | Last.fm API         |
| Deployment | Railway             |

---

## Database Schema (MVP)

One table only:

```
users
- id
- email
- lastfm_username
- created_at
```

---

## Out of Scope for MVP

- Saving or caching AI-generated context
- Genius/lyrics integration
- Favorites or history
- Any social features
