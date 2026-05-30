# Shepherd

A warm, mobile-first Christian AI Bible companion. Meet **Shep the Shepherd** — a gentle sheep who offers Scripture-grounded encouragement, live chat, Bible study, and daily devotions.

## Features

### Home
- Daily Quest (3 tasks → faith streak)
- Verse of the Day
- Shep onboarding for new users
- Prominent “Talk to Shep” CTA

### Live Chat with Shep (Voice-first + 3D)
- **3D procedural Shep** in a meadow sanctuary (React Three Fiber)
- **Hold to Speak** — primary input; continuous listening toggle available
- **Streaming responses** (Vercel AI SDK)
- **Text-to-speech** — Shep speaks replies (toggle auto-speak)
- **Type instead** — collapsible keyboard fallback
- **Persistent chat history** (localStorage via Zustand)
- Rate-limited `/api/chat` endpoint

### Bible Reader
- [helloao.org](https://bible.helloao.org) API — free translations (BSB, WEB, KJV, etc.)
- Book / chapter / verse picker + free-text references
- Commentary support, keyword highlighting, favorites, copy & share

### Devotions, Journal, Profile
- Daily devotions by theme
- Prayer journal linked to verses and chats
- Faith dashboard: streak, stats, saved verses, activity

### Design & PWA
- Unified 2D + 3D Shep visual identity (`src/lib/shep-design.ts`)
- Light / dark / system theme + high contrast mode
- PWA manifest + PNG install icons (`npm run icons`)

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Lucide React · Zustand · Vercel AI SDK
- React Three Fiber + drei (chat 3D scene)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` → `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No* | Live GPT chat (`gpt-4o-mini`). Without it, demo mode streams Scripture-grounded replies. |
| `CHAT_RATE_LIMIT_MAX` | No | Max chat requests per IP per window (default `30`) |
| `CHAT_RATE_LIMIT_WINDOW_SEC` | No | Rate limit window in seconds (default `60`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Planned | Supabase project URL (auth + sync — not wired yet) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Planned | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Planned | Server-only Supabase key |

\* Required for production AI; optional for local demo use.

### Optional 3D GLB model

Procedural Shep is the default. To use an imported model:

1. Add `public/models/shep.glb` (see `public/models/README.md`)
2. Set `SHEP_USE_GLB = true` in `src/lib/shep-model-config.ts`

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run icons        # Regenerate PWA PNG icons from SVG
npm run test:e2e     # Playwright smoke tests
```

## Deploy checklist (Vercel)

1. Push to GitHub and import project in Vercel
2. Set environment variables (at minimum `OPENAI_API_KEY` for live chat)
3. Optional: `CHAT_RATE_LIMIT_MAX`, `CHAT_RATE_LIMIT_WINDOW_SEC`
4. Deploy — App Router routes and `/api/*` work as serverless functions
5. Verify PWA install on mobile (Safari → Add to Home Screen)
6. **Coming soon:** Supabase env vars + auth when cloud sync lands

## Testing

Smoke tests (Playwright):

```bash
npm run test:e2e
```

Uses system Chrome locally. In CI, run `npx playwright install chromium` before tests.

Covers: home, chat, Bible UI, Bible translations API, chat validation API.

## Project Structure

```
src/
├── app/(app)/          # Home, Chat, Bible, Devotions, Profile, Settings, …
├── app/api/            # chat, bible proxies
├── components/
│   ├── chat/           # 3D scene, chat UI
│   ├── daily-quest/
│   ├── onboarding/
│   └── shep-avatar.tsx # 2D Shep (matches 3D design tokens)
├── lib/
│   ├── shep-design.ts  # Shared colors for 2D + 3D Shep
│   └── shep-system.ts
└── stores/             # Zustand + localStorage persistence
```

## Roadmap

- **Supabase** — auth, cloud sync for chat, favorites, journal, streak
- **Push notifications** — daily verse & devotion (settings UI stubbed)
- **Community feed** — currently local-only until backend exists

## License

Private project. Scripture via [bible.helloao.org](https://bible.helloao.org) (per-translation licenses apply).
