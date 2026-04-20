# Krowdly

Reddit + Nairaland hybrid forum platform built with React + Supabase.

## Tech Stack

- **Frontend**: React 18 + React Router v6 + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Pure CSS (no framework) — IBM Plex Sans, Syne
- **No custom server** — Supabase handles everything

---

## Quick Start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon/public key** (Settings → API)

### 2. Run the database schema

1. Open your Supabase project → **SQL Editor**
2. Copy the contents of `schema.sql` and paste it in
3. Click **Run** — this creates all tables, triggers, indexes and RLS policies

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
krowdly/
├── index.html
├── vite.config.js
├── package.json
├── schema.sql              ← Run this in Supabase SQL Editor
├── .env.example
└── src/
    ├── main.jsx            ← Entry point
    ├── App.jsx             ← Router + layout
    ├── index.css           ← All styles
    ├── lib/
    │   ├── supabase.js     ← Supabase client
    │   └── AuthContext.jsx ← Global auth state
    ├── hooks/
    │   ├── usePosts.js     ← Posts + voting + pagination
    │   └── useInfiniteScroll.js
    ├── components/
    │   ├── Topbar.jsx
    │   ├── Sidebar.jsx
    │   ├── PostCard.jsx
    │   ├── PostFeed.jsx    ← Infinite scroll feed
    │   ├── Widgets.jsx     ← Right panel
    │   ├── AuthModal.jsx
    │   ├── AppShell.jsx
    │   └── Toast.jsx
    └── pages/
        ├── Home.jsx
        ├── Community.jsx   ← /k/:slug
        ├── Thread.jsx      ← /post/:id
        ├── Submit.jsx      ← /submit
        ├── CreateCommunity.jsx
        ├── Communities.jsx
        ├── Profile.jsx
        └── Search.jsx
```

---

## Features

| Feature | Details |
|---------|---------|
| **Feed** | Global + community-specific, infinite scroll |
| **Sorting** | New (created_at) + Top (vote_count) |
| **Voting** | Optimistic upvote toggle, one vote per user per post |
| **Comments** | Chronological Nairaland-style thread |
| **Communities** | Create, join, browse |
| **Auth** | Supabase email/password, session persistence |
| **Search** | Posts + communities by title/name |
| **Profile** | View your posts, edit bio |
| **RLS** | Full row-level security — users only modify their own data |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users with username, bio, avatar |
| `communities` | Forum communities with slug, icon, member_count |
| `community_members` | User → community join table |
| `posts` | Posts with vote_count + comment_count (denormalised via triggers) |
| `comments` | Chronological comments on posts |
| `votes` | Unique user+post upvotes |

**Triggers automatically:**
- Create a profile when a user signs up
- Increment/decrement `vote_count` on posts when votes are added/removed
- Increment/decrement `comment_count` on posts when comments are added/removed

---

## Deploying to Vercel / Netlify

```bash
npm run build
```

Then deploy the `dist/` folder. Set the environment variables in your hosting dashboard.

For client-side routing (React Router), add a redirect rule:

**Vercel** — `vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Netlify** — `public/_redirects`:
```
/*  /index.html  200
```
