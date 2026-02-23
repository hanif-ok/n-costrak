# Stopping Note — 2026-02-23

## What Was Built

The entire application is functional and builds cleanly. All 4 phases from the roadmap were implemented in a single session.

### Completed

| Component | Files | Status |
|-----------|-------|--------|
| **Project Scaffold** | Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS v4 | Done |
| **Calculation Engine** | `src/engine/` — nominal, rasio, yoy, proyeksi, peringatan | Done, 25 unit tests passing |
| **Zustand Stores** | `src/store/` — profilStore (persisted), inputStore (persisted), simulasiStore (NOT persisted), appStore | Done |
| **Indonesian Formatting** | `src/lib/formatAngka.ts` — Rp format, %, titik ribuan, koma desimal | Done |
| **Input Forms** | `src/pages/InputPage.tsx` — 8-step wizard: profil cabang, RKAP, target beban/premi, realisasi beban/premi, data tahun lalu, proyeksi paruh bulan | Done |
| **Dashboard** | `src/pages/DasborPage.tsx` — 3 KPI cards (Nominal, Rasio, YoY) with RAG colors, Tabel Nominal, Tabel Rasio, Tabel YoY, peringatan dini, proyeksi paruh bulan | Done |
| **Charts** | `src/components/charts/` — 4 Recharts charts: beban vs target (bar), rasio tren (line), YoY comparison (bar), kumulatif YTD (area) | Done |
| **Simulation** | `src/pages/SimulasiPage.tsx` — "Bagaimana Jika" panel, isolated simulasiStore, MODE SIMULASI banner, "Terapkan ke Data" action, minimum premi calculation | Done |
| **Data Management** | `src/pages/DataPage.tsx` — JSON export/import, data reset, profil summary, beforeunload save reminder | Done |
| **Layout** | Sidebar navigation, responsive design, Askrindo blue branding | Done |
| **UI Components** | Card, StatusBadge, StatusDot, NumberInput | Done |

### Build & Test Status

```
TypeScript:  0 errors
Unit Tests:  25/25 passing
Build:       Succeeds (dist/ ~630KB JS gzipped to ~186KB)
Dev Server:  npm run dev → http://localhost:5173/
```

### File Structure Created

```
src/
├── engine/                          # Pure calculation functions (NO React)
│   ├── types.ts                     # All shared types/interfaces
│   ├── nominal.ts                   # Nominal YTD vs target
│   ├── rasio.ts                     # Beban/premi ratio
│   ├── yoy.ts                       # Year-on-year growth
│   ├── proyeksi.ts                  # Mid-month projection
│   ├── peringatan.ts                # Warning system + projective alerts
│   ├── index.ts                     # Barrel exports
│   └── __tests__/                   # Vitest unit tests
│       ├── nominal.test.ts          # 13 tests
│       ├── rasio.test.ts            # 4 tests
│       ├── yoy.test.ts              # 5 tests
│       └── proyeksi.test.ts         # 3 tests
├── store/                           # Zustand state management
│   ├── profilStore.ts               # Branch profile + RKAP (persisted)
│   ├── inputStore.ts                # Monthly realisasi data (persisted)
│   ├── simulasiStore.ts             # Simulation overrides (NOT persisted)
│   ├── appStore.ts                  # UI state: active tab, active month
│   └── index.ts
├── hooks/
│   └── useBPRData.ts                # Master hook bridging stores + engine
├── lib/
│   └── formatAngka.ts               # Indonesian number/currency formatting
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx              # App sidebar navigation
│   ├── ui/
│   │   ├── Card.tsx                 # Reusable card component
│   │   ├── StatusBadge.tsx          # RAG status badge + dot
│   │   └── NumberInput.tsx          # Numeric input with suffix
│   └── charts/
│       ├── GrafikBebanVsTarget.tsx   # Bar chart
│       ├── GrafikRasioTren.tsx       # Line chart
│       ├── GrafikYoY.tsx             # Side-by-side bar chart
│       └── GrafikKumulatifYTD.tsx    # Area chart
├── pages/
│   ├── DasborPage.tsx               # Dashboard with KPI cards, tables, charts
│   ├── InputPage.tsx                # 8-step data entry wizard
│   ├── SimulasiPage.tsx             # What-if simulation
│   └── DataPage.tsx                 # Export/import/reset
├── App.tsx                          # Main app with sidebar + tab routing
├── main.tsx                         # Entry point + beforeunload handler
└── index.css                        # Tailwind + custom theme colors
```

## What's NOT Done Yet

These items from the PRD/roadmap were not implemented:

| Feature | Priority | Notes |
|---------|----------|-------|
| **XLSX export/import** | High | Needs SheetJS 0.20.3 installed from CDN tarball (`npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`). JSON export works as interim. |
| **Multi-branch profiles** | Medium | Store supports it conceptually but UI for switching profiles not built |
| **RKAP revision support** | Medium | Storing pre/post-revision RKAP versions not implemented |
| **Print/PDF export** | Low | Print stylesheet started (`.no-print` class exists) but no dedicated print view |
| **PWA/Service Worker** | Low | `vite-plugin-pwa` not yet installed/configured. App works offline via browser cache but not formally a PWA. |
| **Projective warning ("akan melebihi target bulan X")** | Medium | Engine function `proyeksiMelebihiTarget()` exists and works, displayed on dashboard, but not as a persistent notification |

## How to Resume

```bash
cd calculator_biaya_pemasaran
npm run dev          # Start dev server
npm test             # Run 25 unit tests
npm run build        # Production build
```

Key decisions already made:
- All monetary values in juta Rupiah
- Floating-point: `Math.round(x * 100) / 100` before threshold comparisons
- RAG thresholds: hijau < 80%, kuning 80-99%, merah >= 100%
- YoY: bahaya if > 0%, aman if <= 0%
- simulasiStore deliberately NOT persisted to prevent data corruption

---
*Session stopped: 2026-02-23*
