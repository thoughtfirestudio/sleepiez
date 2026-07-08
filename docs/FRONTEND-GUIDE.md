---
type: Guide
title: Sleepiez — Frontend Guide
description: React/Vite SPA with Tailwind CSS — pages, routing, PWA, and design token system.
tags: [frontend, react, vite, tailwind, pwa, design-system]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Frontend Guide

Mobile-first PWA built with React 18 + Vite + Tailwind CSS. Warm cream/gold design system.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 |
| Build | Vite |
| CSS | Tailwind v3 |
| Routing | React Router v6 (hash-based) |
| PWA | vite-plugin-pwa + service worker |
| Fonts | Sora (display), Inter (body) — Google Fonts |

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Team card, lineup, player cards with scores |
| `/standings` | Standings | League standings table + Sacko meter |
| `/matchups` | Matchups | Live scoring, roster compare, matchup stats |
| `/waivers` | Waivers | Available players, FAAB bids |
| `/profile` | Profile | User settings, league info |
| `/chaos-config` | Chaos Config | Admin panel to toggle chaos rules |

---

## Design System

All tokens in `tailwind.config.js`:

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `ink-900` | `#1A1A18` | Chrome, text, nav pill |
| `ink-700` | `#3D3B35` | Strong body text |
| `ink-600` | `#57544C` | Secondary/meta text |
| `cream-50` | `#F6F3EC` | Page background |
| `surface` | `#FFFFFF` | Cards, sheets |
| `gold-500` | `#F4C43D` | Primary CTA, active states |
| `gold-100` | `#FBEBC0` | Highlighted player cards |
| `green-500` | `#33C77E` | Live indicator |
| `red-500` | `#E1503F` | Pulse dot, alerts |

### Typography
| Token | Font | Weight | Size |
|-------|------|--------|------|
| `display-xl` | Sora | 800 | 34px |
| `display-lg` | Sora | 700 | 24px |
| `title` | Sora | 700 | 18px |
| `body-sz` | Inter | 500 | 15px |
| `label` | Inter | 600 | 13px |
| `caption` | Inter | 700 | 11px |

### Component Classes (Tailwind `@apply`)
| Class | Purpose |
|-------|---------|
| `.btn-primary` | Gold filled CTA button |
| `.btn-secondary` | Dark outlined button |
| `.card` | White card with shadow |
| `.card-accent` | Gold-tinted highlight card |
| `.badge-live` | Green "Live" status pill |
| `.badge-bye` | Gold "Bye" status pill |
| `.nav-pill` | Dark floating bottom nav |
| `.player-card` | Player roster card (gold or white) |

---

## PWA

- `manifest.json` — standalone display, ink theme color, SVG icons
- Service worker — cache-first, falls back to network
- 60s polling via `setInterval` for chaos announcements (`/api/announcements`)
- Since iOS PWAs can't do push notifications, use the polling + full-screen modals for "SHAME ALERT" events

---

## API Client

All API calls go through `api.ts` which wraps `fetch` with credentials and JSON handling. The frontend **never** calls Sleeper directly.

```typescript
import { api } from "./api";
const standings = await api.get("/league/standings");
```

---

## Reference

- [`ARCHITECTURE-GUIDE.md`](ARCHITECTURE-GUIDE.md) — system overview
- [`API-GUIDE.md`](API-GUIDE.md) — all REST endpoints
