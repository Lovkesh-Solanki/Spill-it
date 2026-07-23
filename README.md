# SpillIt

**Spin. Choose. Spill.**

A browser-based Truth or Dare game — AI-flavored prompts across four difficulty tiers, a live bottle-spin mechanic, forfeit tracking with a punish twist, and both a pass-the-device local mode and (coming soon) online rooms with chat and voice.

🔗 **Live:** _coming soon at [spillit.xyz](https://spillit.xyz)_

---

## Features

- 🍾 **Bottle-spin mechanic** — randomly selects who's up each round
- 🎯 **Four difficulty tiers** — Children, Teens, Adult, Spicy, with a mandatory age-consent gate before Adult/Spicy content shows
- 🔀 **Truth / Dare / Random** — Random splits 50/50, resolved live
- 🏆 **Scoreboard + Punish mechanic** — the player with the most forfeits gets a dare from the group
- 🚩 **Report system** — flag a prompt, with categorized reasons
- 🎨 **9 themes** — 4 free, 1 hidden (code-unlockable), and 5 premium romantic/anime-inspired themes with animated particle effects (petals, stars, embers) — no sourced art, fully original CSS/SVG
- 🧭 **Site-wide navbar** with live theme switching
- 👥 **Online rooms** _(in progress)_ — password-protected or open, persistent accounts, text chat, voice chat, room size limits, verified-member-only option

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) + TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Realtime, Row Level Security |
| Hosting | [Vercel](https://vercel.com) (frontend) |

## Project structure

```
Spill-it/
└── Client/              # the Next.js app — see Client/README.md to run it locally
    ├── src/app/          # routes (App Router)
    ├── src/components/   # UI components (local-mode game screens, shared nav/theme UI)
    ├── src/contexts/      # React context providers (theming)
    ├── src/lib/           # game engine, theme registry, Supabase clients
    ├── src/data/          # the truth/dare prompt bank
    └── supabase/          # SQL schema + RLS policies
```

## Getting started

See **[`Client/README.md`](./Client/README.md)** for local setup, environment variables, and how to apply the Supabase schema.

## Roadmap

- [x] **Phase 1** — Local mode: bottle spin, prompt bank, scoreboard, punish mechanic, report form, theming
- [ ] **Phase 2** — Accounts, rooms, text chat *(in progress)*
- [ ] **Phase 3** — Voice chat (WebRTC), room persistence/expiry, password-protected rooms
- [ ] **Phase 4** — Free-tier LLM-generated prompt variety, monetization, native app

## License

All rights reserved. This is a private/commercial project — see [`Client/README.md`](./Client/README.md#license) for details.
