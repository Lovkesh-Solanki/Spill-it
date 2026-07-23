# SpillIt — Client

The Next.js app. See the [repo root README](../README.md) for the project overview.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)

## Setup

```bash
npm install
```

Create `.env.local` in this folder with your Supabase project's values (**Project Settings → API** in the Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is safe to expose to the browser — that's what it's for. Real access control is enforced by Postgres Row Level Security (see below), not by keeping this key secret.

### Apply the database schema

1. Open your Supabase project → **SQL Editor** → New query
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Run it — this creates every table, RLS policy, and helper function (room creation/joining, bcrypt password hashing, auto-hide-on-report, etc.)
4. Under **Authentication → Providers**, confirm **Email** is enabled
5. Under **Authentication → URL Configuration**, set the Site URL (`http://localhost:3000` locally; your production domain once deployed)

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables reference

| Variable | Where to find it | Safe to expose to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Yes |

Never add `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_` variable if you introduce it later — that key bypasses Row Level Security entirely and must stay server-only.

## Deploying

Frontend deploys to [Vercel](https://vercel.com). Add the same two environment variables in the Vercel project's settings before deploying — they aren't committed to the repo (`.env.local` is git-ignored).

## License

All rights reserved — this code is not currently licensed for reuse. If that changes (e.g. open-sourcing parts of it later), a `LICENSE` file will be added at the repo root.
