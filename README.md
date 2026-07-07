# ⚡ Toolverse

> Free, privacy-first utility hub. PDF · Images · Finance · Dev · Social · Resume  
> No sign-up · No uploads · Files stay in your browser · Forever free

**Live:** `toolverse.vercel.app` → [Link](https://toolverse.vercel.app/)  
**Docs:** `toolverse.vercel.app/docs` or separate — see below  
**Status:** Phase 1 in progress — Compress PDF live, 5 more tools shipping soon

---

## What's in this repo

A Next.js 14 app that runs ~90% of its processing entirely in the browser — no server round-trips, no file uploads, no cost. The other 10% (PDF ↔ Word/Excel) proxies to a LibreOffice container on Railway.

Full architecture, tool list, database schema, API design, SEO strategy, monetization model, folder structure, and build roadmap are documented in **`/public/docs/index.html`** — open it in a browser.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| PDF core | pdf-lib (browser) |
| PDF preview | PDF.js |
| Images | Canvas API |
| OCR | Tesseract.js |
| Word/Excel | LibreOffice on Railway |
| Auth | Clerk |
| Database | Supabase (Postgres + RLS) |
| Rate limiting | Upstash Redis |
| Hosting | Vercel |
| CDN / DDoS | Cloudflare |

---

## Quick start

```bash
git clone <repo-url>
cd toolverse
pnpm install
# No .env.example file; create .env.local based on the Environment vars below
pnpm dev
# → http://localhost:3000
```
Note: Create a `.env.local` file in the root and fill in the variables as described in the Environment section below.

---

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Railway (LibreOffice)
RAILWAY_CONVERT_URL=
RAILWAY_API_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://toolverse.vercel.app
NEXT_PUBLIC_APP_NAME=Toolverse
```

---

## Project structure

```
toolverse/
├── app/
│   ├── (marketing)/         # Homepage, blog, API docs
│   ├── (tools)/             # 51 tool pages (SSR for SEO)
│   │   ├── compress-pdf/
│   │   ├── merge-pdf/
│   │   ├── image/
│   │   ├── finance/
│   │   ├── dev/
│   │   ├── social/
│   │   └── docs/
│   ├── (dashboard)/         # Auth-required user dashboard
│   └── api/
│       ├── convert/         # LibreOffice proxy
│       ├── analytics/       # Tool event tracking
│       └── user/            # Plan status
│
├── components/
│   ├── tools/               # UploadZone, ProcessingBar, DownloadButton
│   │                        # FileSummary, RelatedTools, FAQSection
│   ├── layout/              # Header, Footer, Breadcrumb
│   ├── home/                # HeroSearch, ToolGrid, WeatherWidget, Todo
│   └── ui/                  # shadcn/ui components
│
├── lib/
│   ├── pdf/                 # compress · merge · split · rotate · protect
│   ├── image/               # compress · resize · convert · passport
│   ├── finance/             # gst · emi · sip · tax · vat
│   ├── db/                  # Supabase client
│   └── utils/               # file validation · rate limiting · analytics
│
├── config/
│   └── tools.ts             # Master list: name, url, category, related, keywords
│
└── public/
    ├── og/                  # OG images — 1200×630, one per tool
    └── docs/
        └── index.html       # Full project documentation (open in browser)
```

---

## Tools — current status

| Tool | Route | Status |
|---|---|---|
| Compress PDF | `/compress-pdf` | ✅ Live |
| Merge PDF | `/merge-pdf` | 🔜 Soon |
| Split PDF | `/split-pdf` | 🔜 Soon |
| PDF → Word | `/pdf-to-word` | 🔜 Soon |
| Image → PDF | `/jpg-to-pdf` | 🔜 Soon |
| AI Summarise | `/summarize-pdf` | 🤖 AI |

**51 tools planned across 6 categories** — full list in `/public/docs/index.html`.

---

## Build phases

```
Phase 1  Weeks 1–4   Launch MVP — compress, merge, split, image tools
Phase 2  Month 2     Global + India tools — GST, QR, JSON formatter, AdSense
Phase 3  Month 3     Auth + resume builder — Clerk, Supabase RLS, Railway
Phase 4  Month 4–6   Scale — all tools, developer API, SEO blog, i18n
Phase 5  Month 6+    PWA, regional finance modules, 100k visits/mo target
```

---

## 🌐 Domain names

Currently on `toolverse.vercel.app`. Recommended production domains:

### Product (main app)
| Option | Notes |
|---|---|
| `toolverse.com` | Best — clean, brandable, memorable |
| `toolverse.app` | Modern `.app` TLD, good for tools |
| `toolverse.io` | Dev-friendly but slightly less consumer |
| `usetoolverse.com` | Fallback if `.com` is taken |

### Docs site (`/public/docs/index.html`)
| Option | Notes |
|---|---|
| `docs.toolverse.com` | Standard — subdomain of main domain |
| `toolverse.com/docs` | Preferred if keeping it in-app (no extra domain) |
| `toolverse.dev` | Doubles as a docs/developer portal brand |

### Internal / email
| Purpose | Recommended |
|---|---|
| Transactional email | `hello@toolverse.com` or `noreply@toolverse.com` |
| Support | `support@toolverse.com` |
| Email provider | Resend or Postmark — both work with Vercel easily |

> **Recommendation:** buy `toolverse.com` first. Use `toolverse.com/docs` (in-app route) to avoid managing a second domain while in early stages. Add `docs.toolverse.com` later when the docs site warrants it.

---

## Key files

| File | Purpose |
|---|---|
| `app/compress-pdf/page.tsx` | Compress tool UI — drop zone, presets, result screen |
| `app/page.tsx` | Homepage — hero, tool grid, stats, CTA |
| `app/layout.tsx` | Root layout — fonts, metadata |
| `lib/compress.ts` | Core compression logic — pdf-lib, level/preset helpers |
| `config/tools.ts` | Master tool registry |
| `public/docs/index.html` | Full project documentation |

---

## Docs

Everything not in this file — architecture diagrams, full tool list, database schema, API design, SEO keyword strategy, monetization model, performance targets, privacy summary — is in:

```
public/docs/index.html
```

Open it directly in a browser. No build step needed.
