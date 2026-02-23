# Stack Research

**Domain:** Client-side financial calculator / dashboard SPA (insurance branch marketing expense monitor)
**Researched:** 2026-02-23
**Confidence:** HIGH (core stack), MEDIUM (offline/deployment details)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Stable since Dec 2024; Concurrent features (useTransition) handle real-time "what-if" recalculation without jank; React 19 is the obvious choice for new projects in 2026 |
| TypeScript | 5.9.x | Type safety | Strict mode prevents math errors in financial calculations; number vs string confusion in currency values is a real runtime bug category; Vite supports it natively via esbuild |
| Vite | 7.x (latest) | Build tool + dev server | Released June 2025; fastest HMR for iterating on UI; `npm create vite@latest` scaffold is the standard greenfield entrypoint; `baseline-widely-available` target eliminates IE-era cruft |
| Tailwind CSS | 4.2.x | Utility CSS | v4 stable since Jan 2025; new Vite plugin (`@tailwindcss/vite`) replaces PostCSS config entirely — one line in vite.config; automatic content detection means zero config; 5x faster builds than v3 |
| Recharts | 3.7.0 | Data visualization | Declarative React components wrapping D3; SVG output; built for dashboards with <100 data points (monthly financial data fits this perfectly); v3 adds native `responsive` prop, better TypeScript types, and resolves React 19 peerDep issues that plagued 2.x |
| SheetJS (xlsx) | 0.20.3 | XLSX import/export | Only library that handles both reading Excel files Pinca already have and writing new ones; 0.20.3 fixes CVE-2023-30533 and CVE-2024-22363 (high severity in 0.18.5 on npm registry) |
| Zustand | 5.0.11 | Global state management | 20M+ weekly downloads; no boilerplate vs Redux; stores calculator state (RKAP, monthly actuals, projection) as a single typed store; persist middleware handles localStorage sync out of the box |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vite-plugin-pwa` | 1.1.0 | Offline service worker | Enables app to function after first load with no internet; pre-caches all static assets via Workbox; required for branches with unreliable connectivity |
| `zustand/middleware` (persist) | bundled with Zustand | localStorage persistence | Serialize/deserialize calculator state automatically; use for branch profile, RKAP, monthly realization data |
| `@tailwindcss/vite` | bundled with Tailwind v4 | Vite plugin for Tailwind | Replaces PostCSS config; add as Vite plugin, then `@import "tailwindcss"` in CSS — done |
| `prettier-plugin-tailwindcss` | latest | Class sorting | Auto-sorts Tailwind classes in consistent order; prevents merge conflicts on class lists |
| `clsx` | ^2.x | Conditional className | Composing conditional Tailwind class strings cleanly; replaces template literal soup |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@vitejs/plugin-react` | Babel-based React Fast Refresh | Use this (not `plugin-react-swc`) for broadest compatibility; v5.1.4 |
| Vitest | Unit testing | Same config as Vite; test financial calculation functions in isolation; essential for BPR parameter math |
| ESLint + `eslint-plugin-react-hooks` | Linting | Catches stale closures in calculation hooks; use flat config format (ESLint 9+) |
| TypeScript strict mode | Type checking | `"strict": true, "noUnusedLocals": true, "noUncheckedSideEffectImports": true` — catches accidental undefined in monthly data arrays |

---

## Installation

```bash
# Scaffold project
npm create vite@latest calculator-biaya-pemasaran -- --template react-ts

# Navigate
cd calculator-biaya-pemasaran

# Core runtime dependencies
npm install recharts zustand clsx

# SheetJS — MUST use CDN tarball, NOT npm registry (0.18.5 on registry has high severity CVEs)
npm install --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa prettier prettier-plugin-tailwindcss

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**vite.config.ts after installation:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*'],
      },
    }),
  ],
})
```

**src/index.css:**
```css
@import "tailwindcss";
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts 3.7 | Chart.js via react-chartjs-2 | If you need canvas rendering for 10,000+ data points — irrelevant for monthly financial data |
| Recharts 3.7 | Victory Charts | If your team has strong Formidable Labs contract — no advantage here |
| Zustand | Redux Toolkit | Only for enterprise multi-team apps with complex interdependent state across dozens of slices — overkill for a single-page calculator |
| Zustand | React Context + useReducer | Fine for 1-2 values, breaks down when calculator state is 200+ fields across 12 months × 3 segments |
| Tailwind CSS v4 | Tailwind CSS v3 | If the project is already on v3 — greenfield in 2026 should use v4 |
| vite-plugin-pwa | Manual service worker | Manual SW gives more control but requires weeks of work vs hours with the plugin |
| SheetJS 0.20.3 (CDN) | ExcelJS | ExcelJS is npm-installable with no CVEs, but has weaker browser support and no Excel 97-2003 (.xls) read capability — Pinca may have legacy .xls files |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `xlsx` from npm registry (`npm install xlsx`) | Latest npm version is 0.18.5 which has CVE-2023-30533 (prototype pollution) and CVE-2024-22363 (ReDoS) — both high severity | Install from CDN: `npm install --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` |
| Create React App (CRA) | Deprecated; last release 2022; slow builds; uses webpack 4; dead project | `npm create vite@latest` |
| Moment.js | 67KB bundle, deprecated by authors, timezone handling is broken; this app only needs month labels | Built-in `Intl.DateTimeFormat` with `id-ID` locale |
| i18n libraries (react-i18next, etc.) | App is Indonesian-only — no language switching needed, ever | Hardcode Bahasa Indonesia strings directly in JSX |
| IndexedDB libraries (Dexie, idb-keyval) | Adds complexity for no gain; the app's data is small (12 months × 3 segments × a few fields = <10KB) | Zustand `persist` middleware writing to `localStorage` |
| Next.js | Server framework; this app is explicitly client-side only with no backend; SSR/RSC adds complexity with zero benefit | Vite SPA |
| React Router | Adds routing complexity for what is effectively a single-view calculator with tabs | Simple tab state in Zustand |

---

## Stack Patterns by Variant

**If deployment is "web only" (hosted on static server):**
- vite-plugin-pwa handles offline caching after first visit
- Standard HTML5 routing works fine

**If deployment is "local file" (user saves and opens index.html from desktop):**
- Must use `HashRouter` pattern OR a single-file build approach
- Consider `vite-plugin-singlefile` to inline all JS/CSS into one HTML file (avoids CORS block on `file://` protocol module imports)
- This is likely needed given the constraint "bisa disimpan/dibuka lokal" (can be saved and opened locally)

**If user wants to pre-fill data from previous year (existing Excel from Cirebon):**
- SheetJS `read()` + `sheet_to_json()` on import handles arbitrary Excel structures
- Map to internal JSON schema on import, not raw cell values

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Recharts 3.7.0 | React 18+, React 19 | React 19 peerDep resolved in 3.x; no override needed unlike 2.x |
| Tailwind CSS 4.2.x | Vite 5+, 6+, 7+ | `@tailwindcss/vite` plugin required; PostCSS approach still works but the plugin is faster |
| vite-plugin-pwa 1.1.0 | Vite 5+ | Requires Vite 5+; compatible with Vite 7 |
| SheetJS 0.20.3 | All modern bundlers | Install via CDN tarball, not npm; vendoring locally in `/vendor/` is recommended for air-gap stability |
| Zustand 5.0.11 | React 18+, React 19 | Full React 19 support; `persist` middleware is included in the package |
| `@vitejs/plugin-react` 5.1.4 | Vite 5+, 6+, 7+ | Latest; compatible with React 19 |

---

## SheetJS Installation Warning

SheetJS is the correct library for this project (reads and writes real Excel .xlsx files Pinca are familiar with). However, the npm registry version (`npm install xlsx`) is stale at 0.18.5 and has unpatched CVEs.

**Required installation pattern:**
```bash
# Remove stale version if present
npm rm --save xlsx

# Install from authoritative CDN
npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

**Optionally vendor the tarball** (recommended for air-gap stability — download and commit to `/vendor/`):
```bash
curl -o vendor/xlsx-0.20.3.tgz https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
# Then: npm i --save file:./vendor/xlsx-0.20.3.tgz
```

---

## Indonesian Locale Formatting

No external library needed. The built-in `Intl.NumberFormat` API handles Indonesian formatting natively:

```typescript
// Rupiah currency: Rp 14.340,00
const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

// Percentage: 12,5%
const formatPersen = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);

// Month label: Januari 2024
const formatBulan = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
```

This eliminates any need for `moment.js`, `date-fns`, or `numeral.js`.

---

## Sources

- React 19.2 release blog — https://react.dev/blog/2025/10/01/react-19-2 (HIGH confidence)
- Vite 7.0 announcement — https://vite.dev/blog/announcing-vite7 (HIGH confidence, verified via WebFetch)
- Tailwind CSS v4.0 stable release — https://tailwindcss.com/blog/tailwindcss-v4 (HIGH confidence)
- SheetJS React integration docs — https://docs.sheetjs.com/docs/demos/frontend/react/ (HIGH confidence, verified via WebFetch)
- SheetJS framework install — https://docs.sheetjs.com/docs/getting-started/installation/frameworks/ (HIGH confidence, verified via WebFetch)
- SheetJS CVE-2023-30533 — https://github.com/advisories/GHSA-5pgg-2g8v-p4x9 (HIGH confidence)
- SheetJS CVE-2024-22363 — https://security.snyk.io/vuln/SNYK-JS-XLSX-6252523 (HIGH confidence)
- Recharts 3.7.0 release — https://github.com/recharts/recharts/releases (HIGH confidence, verified via WebFetch)
- Recharts React 19 issue resolution — https://github.com/recharts/recharts/issues/4558 (HIGH confidence, verified via WebFetch)
- Zustand 5.0.11 npm — https://www.npmjs.com/package/zustand (MEDIUM confidence, via WebSearch)
- vite-plugin-pwa 1.1.0 — https://www.npmjs.com/package/vite-plugin-pwa (MEDIUM confidence, via WebSearch)
- Tailwind v4 + Vite plugin setup — https://tailwindcss.com/docs (MEDIUM confidence, multiple WebSearch sources agree)
- Intl.NumberFormat id-ID — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat (HIGH confidence)
- TypeScript 5.9 — https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html (MEDIUM confidence, via WebSearch)

---

*Stack research for: Insurance branch marketing expense monitor SPA*
*Researched: 2026-02-23*
