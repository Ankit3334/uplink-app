# UPLINK

```txt
╔══════════════════════════════════════════════════════════════╗
║  UPLINK // UNDERGROUND DATA STREAM                           ║
║  status: ONLINE   mode: CHRONOLOGICAL   ui: TERMINAL/CYBER   ║
╚══════════════════════════════════════════════════════════════╝
```

> `// TERMINAL-STYLE SOCIAL NETWORK`  
> A raw, hacker-aesthetic alternative to sterile, algorithm-driven feeds.  
> Built with **Next.js (App Router)** + **Supabase**.

---

## // MANIFESTO

Social media didn’t just get cleaner — it got quieter, flatter, and more controlled.

Feeds turned into engagement machines: opaque algorithms, optimized loops, rounded-everything interfaces, and the same sterile tone everywhere. You don’t browse a stream anymore; you get sorted by one.

**UPLINK exists as a counter-signal.**

- **Chronological, not curated by black box** — transmissions appear as a data stream, not as an attention slot machine.
- **Raw over polished** — neon-on-black, monospace metadata, sharp corners, scanlines, terminal language (`BOOST`, `THREAD`, `BROADCAST`, `UPLINK`).
- **Intentional interaction** — share image transmissions, boost signals, inject thread data, and view operator nodes without the usual corporate gloss.

It’s not trying to look “friendly.” It’s trying to feel **alive**.

---

## // TECH STACK

```txt
[ FRONTEND ]  Next.js 16 (App Router) · React 19 · TypeScript
[ STYLING  ]  Tailwind CSS v4 · JetBrains Mono · custom neon/cyber utilities
[ MOTION   ]  Framer Motion (subtle fade/transition effects)
[ BACKEND  ]  Supabase (Auth, Postgres Database, Storage)
[ SSR/AUTH ]  @supabase/ssr (browser/server clients, cookie-based sessions)
[ UI ICONS ]  lucide-react
[ DEPLOY   ]  Vercel-ready (vercel.json, security headers, env template)
```

Core product modules implemented:
- Auth (email/password) + mandatory onboarding (username claim)
- Protected app shell/routes
- Image upload/transmission to Supabase Storage
- Chronological feed with boosts and threads
- Public/own profile nodes, stats, and transmission grids

---

## // LOCAL DEVELOPMENT SETUP

### 1) Prerequisites

```bash
# required
node -v   # Node.js 20+ recommended
npm -v    # npm 10+ recommended
```

- A [Supabase](https://supabase.com/) project
- (Optional) [Vercel CLI](https://vercel.com/docs/cli) for deployment workflows

### 2) Clone & install

```bash
git clone <your-repo-url> uplink-app
cd uplink-app
npm install
```

### 3) Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

> Get these from: **Supabase Dashboard → Project Settings → API**

### 4) Provision Supabase (database + storage)

1. Open **Supabase Dashboard → SQL Editor**
2. Run the schema in [`supabase/schema.sql`](./supabase/schema.sql)  
   - Creates tables: `profiles`, `posts`, `boosts`, `threads`
   - Enables RLS + policies
   - Adds helper RPC functions for denormalized counters
3. Open **Supabase Dashboard → Storage**
4. Create a bucket named **`uplink-posts`**
   - Used for image transmissions (`<user_id>_<timestamp>.jpg`)
   - Configure access/policies so post images can be read as intended by your app

### 5) Run the app

```bash
npm run dev
```

```txt
> LOCAL NODE READY
> open: http://localhost:3000
```

### 6) Quality checks

```bash
npm run lint
npm run build
```

---

## // DEPLOYMENT (VERCEL)

This repo includes:
- [`vercel.json`](./vercel.json) — Next.js build settings + baseline security headers
- [`.env.example`](./.env.example) — production env var template

Typical flow:
1. Push repo to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Set production env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

---

## // PROJECT STRUCTURE (HIGH-LEVEL)

```txt
app/
  (app)/              # protected app routes (feed, upload, profile, posts, users)
  auth/               # terminal-style auth flow
  onboarding/         # mandatory username/profile initialization
  actions/            # server actions (auth, posts, profile)
src/
  components/         # shared UI (nav, post grid, fade-in)
  lib/                # supabase clients, auth helpers, types/utils
supabase/
  schema.sql          # database schema, RLS policies, RPC helpers
```

---

## // SHOUTOUTS

Built with and inspired by excellent tools:

- [Next.js](https://nextjs.org/) — App Router, Server Components/Actions, modern React foundation
- [Supabase](https://supabase.com/) — Auth, Postgres, Storage, and a great developer workflow
- [Vercel](https://vercel.com/) — deployment platform and DX
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling engine
- [Framer Motion](https://www.framer.com/motion/) — motion primitives
- [Lucide](https://lucide.dev/) — icon set
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — monospace type that fits the terminal vibe

```txt
// END OF FILE
// KEEP THE SIGNAL CLEAN.
```
