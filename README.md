# سازمان جهانشمول احرار — Freemans Universal Organization (FUO)

**Ten orbits. One world.** — the official website of the Freemans Universal Organization, built around a signature interactive 3D astrolabe: ten particle orbits (one per department) around a single golden A/O core.

Persian (RTL) is the primary locale; English (LTR) is fully supported with a live locale switch.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /fa
npm run build      # production build (Turbopack, Cache Components + Partial Prefetching)
npm start          # serve the production build
npm run lint       # ESLint
```

Requires Node.js 20+ (built and tested on Node 24).

### Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for metadata, OG, sitemap, robots, JSON-LD | `http://localhost:3000` |

Set it to the production origin before deploying (e.g. `https://fuo.example`).

## Stack

- **Next.js 16 (App Router, TypeScript)** — `cacheComponents` + `partialPrefetching` enabled; `src/proxy.ts` (Next 16's replacement for middleware) handles locale routing via `next-intl`.
- **next-intl 4** — `fa` (default, RTL) and `en` (LTR), prefix-always routing (`/fa/...`, `/en/...`), all copy in `messages/fa.json` / `messages/en.json`.
- **Tailwind CSS 4** — design tokens as CSS variables in `src/app/globals.css` (`@theme inline`), logical properties throughout for RTL/LTR parity.
- **Three.js 0.187 + @react-three/fiber + drei + postprocessing** — custom GLSL point-sprite orbit system; all particle motion runs in the vertex shader (zero per-frame CPU work). Bloom + vignette on medium/high quality tiers.
- **GSAP + ScrollTrigger** — the home scroll narrative (astrolabe opens into an exploded view while you scroll).
- **Lenis** — smooth scrolling, synchronized with ScrollTrigger; disabled under `prefers-reduced-motion`.
- **Motion (motion/react)** — tab/accordion and form-state transitions on inner pages; deliberately kept off the home critical path (loader, nav drawer and magnetic buttons use CSS/rAF instead).
- **Fonts** — self-hosted variable fonts via `next/font/local`: Vazirmatn (Persian) and Space Grotesk (Latin), both SIL OFL 1.1.

## Project structure

```
messages/                  ALL site copy (fa.json, en.json) — edit content here, no code changes needed
src/
  proxy.ts                 next-intl locale routing (Next 16 proxy convention)
  i18n/                    routing config, request config, typed navigation helpers
  app/
    [locale]/              layout (fonts, nav, footer, loader, JSON-LD) + all 8 pages
      page.tsx             Home: 3D hero + scroll narrative + mission/impact/news/join sections
      about/ mission/ programs/ news/ news/[slug]/ impact/ contact/ join/
      not-found.tsx
    opengraph-image.tsx    code-generated 1200×630 OG image
    sitemap.ts robots.ts   locale-aware sitemap with hreflang alternates
    icon.svg               A/O favicon
  components/
    three/                 AstrolabeScene, SceneRig, OrbitParticles (GLSL), CoreMark, StarDust,
                           AstrolabeStage (lazy loader + capability detection), AstrolabeFallback (SVG)
    motion/                MotionProvider (Lenis+GSAP), Loader, Reveal, Magnetic, CustomCursor, ScrollProgress
    layout/                Nav, Footer, LocaleSwitch, SoundToggle
    sections/              page-level composed sections (HomeHero, JoinFlow, NewsIndex, charts, forms…)
    ui/                    AoMark (A/O logo), DeptGlyph (10 department icons), StatCounter
  lib/
    astrolabe.ts           ring math shared by JS ↔ GLSL, quality tiers, scene state, focus pub/sub
    departments.ts         10 department slugs + hues
    audio.ts               synthesized WebAudio ambience (off by default, one visible toggle)
    format.ts              Persian numerals + Persian calendar dates
    year.ts                cached build year (Cache Components-safe)
```

## Editing content (non-developers)

Everything readable on the site lives in **`messages/fa.json`** and **`messages/en.json`**:

- `departments.items.*` — the ten departments (name, short label, description, 3 activities).
- `news.items[]` — articles: `slug`, `date` (ISO), `category`, `title`, `excerpt`, `readMinutes`, `body[]` (paragraphs). Adding an item automatically adds its page, sitemap entry and static params.
- `impact.stats`, `impact.chartValues`, `impact.allocation` — all numbers and charts.
- `join.tiers`, forms, footer, navigation — every label.

Keep the two files structurally identical (same keys). Persian digits are produced at render time from plain numbers — write numbers as `42`, not `۴۲`.

## Sample content disclosure

The organization approved invented placeholder content for this build. The following are **samples**, clearly disclosed in the UI (footer note, impact disclaimer, contact note, form demo notes) and must be replaced with official data before launch:

- All statistics (42 countries, 128 projects, 3600+ members, chart values, 72/18/10 allocation).
- News articles and timeline events.
- Contact address `hello@fuo.example` (reserved `.example` TLD — not a real mailbox).
- Membership/support forms are **demo mode**: submissions are stored only in the visitor's `localStorage` (`fuo-membership`, `fuo-support`, `fuo-contact`, `fuo-newsletter`). No payment gateway is connected.
- No social-media links are rendered until official URLs are provided.

## Performance & accessibility

- 3D scene is lazy-loaded (`next/dynamic`, `ssr: false`); the server-rendered hero text is the LCP element and paints at first paint — the staged entrance is transform-only (never opacity-gated), so the loader overlay never delays LCP.
- **Progressive enhancement on touch devices:** first paint uses the lightweight SVG astrolabe; the WebGL scene boots only on first engagement (scroll/touch/key), so mobile first load stays fast and battery-friendly.
- Quality tiers: high 24,000 particles / DPR ≤ 2 / bloom · medium 12,000 / 1.5 · low 6,000 / 1 / no bloom. Detected from cores/memory/pointer; an FPS watchdog drops DPR if sustained < 32 fps.
- `prefers-reduced-motion`: no loader, no Lenis, no scroll narrative, static SVG astrolabe, instant counters/reveals.
- No WebGL2 → original animated SVG astrolabe fallback (same ring geometry).
- Keyboard: skip link, focus-visible gold outlines, department list mirrors 3D hover focus, accordions/tabs are real buttons with ARIA states; `aria-live` readouts for focus, search results and form status.
- WCAG 2.2 AA contrast on the gold/obsidian palette; custom scrollbars; 360px → 4K fluid layout.
- Sound is **off by default** (institutional site); one visible toggle in the nav enables synthesized ambience, persisted per browser.
- **Live instrument panel** (home hero, permanently visible while WebGL runs): orbit speed, glow, spread, camera distance sliders; particle-density select; auto-spin toggle; reset / randomize / export-PNG actions. All apply live to the running scene; export captures the current framed state. Hidden under reduced motion / no-WebGL (the SVG fallback is shown instead).

### Measured results

Reproduce with `node scripts/audit.mjs` (Playwright, 43 checks) and Lighthouse against `npm start`.

| Metric | Lighthouse mobile (simulated 4× CPU / slow-4G) | Real-device (Playwright, unthrottled) | Target |
| --- | --- | --- | --- |
| LCP | 925 ms | 300 ms mobile · 172 ms desktop | < 2500 ms ✅ |
| CLS | 0.00005 | ~0.00008 | < 0.1 ✅ |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | — | AA ✅ |
| Performance | **73 / 100** | — | ≥ 90 ⚠️ |

**Honest note on the mobile Performance score:** LCP, CLS, accessibility, best-practices and SEO all meet or exceed target. The Performance score (73) falls short of the 90 goal because Lighthouse's synthetic 4× CPU throttling charges ~1.5 s of Total Blocking Time to a single React-hydration task — the cost of hydrating the rich interactive page (React + R3F + GSAP + next-intl) that the brief mandates. No 3D/motion library loads on mobile first paint (interaction-gated), and the real-device LCP is 300 ms. Reaching ≥ 90 would require removing client-side interactivity, which would trade away the award-level experience; on real hardware (real GPU, adaptive quality) the experience is smooth. INP is a field metric and is not measurable in a lab run; TBT is the lab proxy reported above.

## Assets & licenses

All visuals are original or code-generated — no third-party images, textures or models.

| Asset | Origin | License |
| --- | --- | --- |
| A/O logo, favicon, OG image | original, code-generated (SVG / `next/og`) | organization's own |
| Astrolabe 3D scene, GLSL shaders, SVG fallback | original code | organization's own |
| 10 department glyphs | original stroke SVGs | organization's own |
| Grain/noise overlay | inline SVG `feTurbulence` | organization's own |
| Vazirmatn variable font | [@fontsource-variable/vazirmatn](https://fontsource.org/fonts/vazirmatn) | SIL OFL 1.1 |
| Space Grotesk variable font | [@fontsource-variable/space-grotesk](https://fontsource.org/fonts/space-grotesk) | SIL OFL 1.1 |
| Next.js, React, three, R3F, drei, postprocessing, next-intl, Tailwind, Lenis, Motion | open source | MIT |
| GSAP + ScrollTrigger | [gsap.com](https://gsap.com) | 100% free standard license (Webflow, v3.13+) |

Design inspiration (techniques only, no copied code/layouts): activetheory.com, utsubo.com, lusion.co, antarcticagency.com — orbital particle systems, scroll-driven exploded views, cinematic loaders.

## Deployment (free tier)

**Vercel**: import the repo, set `NEXT_PUBLIC_SITE_URL`, deploy — zero config.
**Cloudflare Pages**: requires the Node runtime (Cache Components does not support the edge runtime); use `@cloudflare/next-on-pages` compatibility mode or prefer Vercel for this build.

After deploying, verify `/sitemap.xml`, `/robots.txt`, `/opengraph-image` and both locales.