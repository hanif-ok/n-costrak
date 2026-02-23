# Architecture Research

**Domain:** Client-side financial calculator / dashboard SPA (offline-first, no backend)
**Researched:** 2026-02-23
**Confidence:** HIGH (verified across official docs, Martin Fowler, Robin Wieruch, Zustand docs)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UI LAYER (React Components)                   │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│  Pages /     │  Dashboard   │  Simulator   │  Data Management        │
│  Views       │  (cards +    │  (what-if    │  (import / export /     │
│  (routing)   │  charts)     │  sliders)    │  profile switcher)      │
├──────────────┴──────────────┴──────────────┴────────────────────────┤
│                        STATE LAYER (Zustand stores)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  profileStore│  │  inputStore  │  │  simulationStore          │   │
│  │  (cabang,    │  │  (realisasi, │  │  (what-if overrides,      │   │
│  │   RKAP,      │  │   premi,     │  │   draft projections)      │   │
│  │   target)    │  │   historis)  │  │                           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                  CALCULATION ENGINE (pure functions, no React)        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐   │
│  │  nominal.ts │  │  rasio.ts   │  │  yoy.ts     │  │ proyeksi  │   │
│  │  (YTD vs    │  │  (beban /   │  │  (growth    │  │ .ts       │   │
│  │   target)   │  │   premi)    │  │   YoY calc) │  │ (mid-mo   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                  PERSISTENCE LAYER                                    │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐   │
│  │  localStorage             │  │  File I/O                      │   │
│  │  (Zustand persist         │  │  (JSON export/import,          │   │
│  │   middleware, auto-sync)  │  │   XLSX export via SheetJS)     │   │
│  └──────────────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Pages/Views | Route containers, assemble feature panels | React components, React Router |
| Dashboard | Display status cards, charts, status colors | Recharts + Tailwind color classes |
| Input Forms | Capture RKAP, monthly actuals, branch profile | Controlled components, react-hook-form |
| Simulator | Accept what-if slider/input overrides, show projection diff | Local state + calc engine |
| Data Manager | File import/export, multi-profile switcher | SheetJS, FileReader API, Zustand actions |
| profileStore | Branch identity, RKAP values, revision history | Zustand + persist middleware |
| inputStore | Monthly realisasi (beban + premi), historical year data | Zustand + persist middleware |
| simulationStore | Ephemeral draft overrides for what-if analysis | Zustand, NOT persisted to localStorage |
| Calculation Engine | Pure BPR parameter formulas: Nominal, Rasio, YoY | Plain TypeScript functions, zero React |
| Persistence Layer | Sync state to localStorage; read/write JSON/XLSX files | Zustand persist, SheetJS, file-saver |

## Recommended Project Structure

```
src/
├── features/                   # Domain features — organized by business capability
│   ├── profil/                 # Branch profile + RKAP setup
│   │   ├── components/         # ProfilForm, RKAPInput, TargetBulananInput
│   │   ├── hooks/              # useProfil, useRKAP
│   │   └── index.ts            # Public exports
│   ├── dashboard/              # Status overview
│   │   ├── components/         # StatusCard, KodeWarna, RingkasanBPR
│   │   ├── hooks/              # useDashboardData (derived from stores + engine)
│   │   └── index.ts
│   ├── tabel/                  # Replicated Excel tables
│   │   ├── components/         # TabelNominal, TabelRasio, TabelYoY
│   │   ├── hooks/              # useTabelData
│   │   └── index.ts
│   ├── grafik/                 # Trend charts
│   │   ├── components/         # GrafikTren, GrafikKumulatif, GrafikYoY
│   │   ├── hooks/              # useGrafikData
│   │   └── index.ts
│   ├── simulasi/               # What-if simulator
│   │   ├── components/         # SimulasiPanel, HasilSimulasi
│   │   ├── hooks/              # useSimulasi
│   │   └── index.ts
│   └── data/                   # Import / export / profile management
│       ├── components/         # ExportButton, ImportButton, ProfilSwitcher
│       ├── hooks/              # useDataIO
│       └── index.ts
├── engine/                     # Pure calculation functions — NO React, NO imports from features
│   ├── nominal.ts              # Nominal YTD vs target calculation
│   ├── rasio.ts                # Beban / premi ratio calculation
│   ├── yoy.ts                  # Year-on-year growth calculation
│   ├── proyeksi.ts             # Mid-month projection (actual day 1-15 + estimate day 16-31)
│   ├── peringatan.ts           # Threshold breach detection
│   ├── simulasi.ts             # What-if computation wrapper
│   └── index.ts                # Re-exports all engine functions
├── store/                      # Zustand stores — global state
│   ├── profilStore.ts          # Branch profile + RKAP (persisted)
│   ├── inputStore.ts           # Monthly actuals, historical data (persisted)
│   ├── simulasiStore.ts        # What-if draft state (NOT persisted)
│   └── index.ts
├── components/                 # Generic reusable UI only (no business logic)
│   ├── ui/                     # Primitives: Button, Card, Badge, Modal
│   ├── layout/                 # AppShell, Sidebar, Header
│   └── formatters/             # IDR number format, Indonesian date format
├── lib/                        # Third-party wrappers
│   ├── storage.ts              # localStorage read/write helpers
│   ├── xlsx.ts                 # SheetJS import/export wrappers
│   └── formatAngka.ts          # Indonesian number format (IDR, %)
├── pages/                      # Route entry points
│   ├── DashboardPage.tsx
│   ├── InputPage.tsx
│   ├── SimulasiPage.tsx
│   └── DataPage.tsx
├── App.tsx                     # Router + top-level layout
└── main.tsx                    # Entry point, Vite
```

### Structure Rationale

- **engine/:** The calculation core is completely isolated from React. This enables unit testing without rendering, and means formulas can be verified independently of UI. Financial logic that goes wrong is a critical bug — isolation forces testability.
- **store/:** Zustand stores are the single source of truth. Components never write directly to localStorage; the persist middleware handles that automatically and synchronously.
- **features/:** Each feature owns its own components and hooks. This prevents the alternative — a flat `components/` folder with 40 files where unrelated concerns mix.
- **simulasiStore (not persisted):** What-if state is ephemeral by design. The user is exploring "what if I spend this much?" — the actual data should not change until they deliberately enter it via the input flow.
- **components/ui/:** Generic primitives (Button, Card, Badge) have no business logic. This boundary prevents a feature from bleeding styling or behavior into shared UI.

## Architectural Patterns

### Pattern 1: Calculation Engine as Pure Functions

**What:** All BPR formulas live in `src/engine/` as plain TypeScript functions that accept data and return results. No React hooks, no state access.

**When to use:** Always. Every calculation — Nominal, Rasio, YoY, projections, threshold checks — uses this pattern.

**Trade-offs:** Slightly more indirection (must pass data in explicitly), but makes testing trivial, eliminates bugs from stale closures, and keeps formulas readable in isolation.

**Example:**
```typescript
// src/engine/rasio.ts
export interface InputRasio {
  bebanYTD: number;
  premiYTD: number;
}

export interface HasilRasio {
  rasio: number;           // beban / premi expressed as percentage
  status: 'aman' | 'perhatian' | 'kritis';
}

export function hitungRasio(input: InputRasio, targetRasio: number): HasilRasio {
  const rasio = input.premiYTD === 0 ? 0 : input.bebanYTD / input.premiYTD;
  return {
    rasio,
    status: rasio <= targetRasio * 0.9
      ? 'aman'
      : rasio <= targetRasio
      ? 'perhatian'
      : 'kritis',
  };
}
```

### Pattern 2: Zustand with Persist Middleware for Offline State

**What:** All persistent state (branch profile, actuals, RKAP) lives in Zustand stores decorated with the `persist` middleware. localStorage sync happens automatically on every state write.

**When to use:** For any data that must survive a page refresh or browser close. Do NOT use for simulation drafts.

**Trade-offs:** Synchronous localStorage is instantaneous for data sizes typical of this app (< 1 MB). The persist middleware handles serialization, versioning, and migration automatically.

**Example:**
```typescript
// src/store/inputStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InputState {
  realisasiBulanan: Record<string, RealisasiBulan>; // key: "2024-10"
  setRealisasi: (bulan: string, data: RealisasiBulan) => void;
}

export const useInputStore = create<InputState>()(
  persist(
    (set) => ({
      realisasiBulanan: {},
      setRealisasi: (bulan, data) =>
        set((state) => ({
          realisasiBulanan: { ...state.realisasiBulanan, [bulan]: data },
        })),
    }),
    {
      name: 'input-store',          // localStorage key
      version: 1,                   // bump this when schema changes
    }
  )
);
```

### Pattern 3: Feature Hooks Bridge Store + Engine

**What:** Custom hooks in each feature folder pull data from Zustand stores, pass it through the calculation engine, and return derived results ready for rendering. Components call the hook and receive calculated values — they do not call the engine directly.

**When to use:** Any time a component needs computed BPR results. Prevents engine calls from being scattered across components.

**Trade-offs:** One extra abstraction layer, but components remain completely logic-free, which enables easy redesign of UI without touching business logic.

**Example:**
```typescript
// src/features/dashboard/hooks/useDashboardData.ts
import { useInputStore } from '@/store/inputStore';
import { useProfilStore } from '@/store/profilStore';
import { hitungRasio } from '@/engine/rasio';
import { hitungNominal } from '@/engine/nominal';
import { hitungYoY } from '@/engine/yoy';

export function useDashboardData(segmen: 'nonKur' | 'kur' | 'gabungan') {
  const input = useInputStore((s) => s.realisasiBulanan);
  const profil = useProfilStore((s) => s.profilAktif);

  const ytd = aggregateYTD(input, segmen);
  const nominal = hitungNominal(ytd, profil.targetNominal[segmen]);
  const rasio = hitungRasio(ytd, profil.targetRasio[segmen]);
  const yoy = hitungYoY(ytd, profil.realisasiTahunLalu[segmen]);

  return { nominal, rasio, yoy };
}
```

## Data Flow

### Primary Input → Display Flow

```
User edits realisasi form
        |
        v
useInputStore.setRealisasi() [Zustand action]
        |
        v
inputStore state updated → persist middleware → localStorage written
        |
        v
Feature hook (e.g. useDashboardData) re-renders
        |
        v
Hook calls engine functions (hitungNominal, hitungRasio, hitungYoY)
        |
        v
Derived results returned to component as plain values
        |
        v
Component renders StatusCard / Table / Chart
```

### Simulation (What-If) Flow

```
User adjusts simulation slider / input
        |
        v
useSimulasiStore.setOverride() [ephemeral, NOT persisted]
        |
        v
useSimulasi hook: merge overrides with real inputStore data
        |
        v
Call engine functions with merged data
        |
        v
SimulasiPanel renders projected results alongside real results
        |
        v
User clicks "Terapkan" → copies override data to inputStore
OR
User navigates away → override state discarded
```

### Persistence / Export Flow

```
Export triggered:
useInputStore.getState() + useProfilStore.getState()
        |
        +--[JSON export]--> JSON.stringify → Blob → file-saver download
        |
        +--[XLSX export]--> SheetJS XLSX.utils.json_to_sheet → workbook → .xlsx download

Import triggered:
User selects file → FileReader reads bytes
        |
        +--[JSON import]--> JSON.parse → validate schema → useInputStore.setState()
        |
        +--[XLSX import]--> SheetJS XLSX.read → sheet_to_json → validate → setState()
        |
        v
localStorage auto-updated via persist middleware
```

### Key Data Flows Summary

1. **Profile setup:** Branch profile and RKAP entered once at setup → persisted indefinitely → read by all features.
2. **Monthly input:** Actuals for each month entered (or imported from XLSX) → stored in inputStore → drives all three BPR calculations.
3. **Mid-month projection:** Day 1-15 actuals + daily average extrapolation → proyeksi engine → displayed on dashboard as forecast.
4. **Simulation:** What-if overrides layered on top of real data → engine runs with combined data → projected results shown in SimulasiPanel, never overwriting real store.
5. **Multi-profile:** profilStore contains a keyed map of profiles (by cabang ID); active profile switched via selector → all feature hooks re-compute automatically.

## Scaling Considerations

This is a single-user, offline-first client app. Scaling is about data volume and complexity, not concurrent users.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single branch, 12 months | Current architecture is exactly right. Zustand + localStorage handles well under 1 MB. |
| Multiple branches, 3+ years historical | LocalStorage can hold ~5–10 MB; still fine. Consider migrating to IndexedDB if profiling shows slowness. |
| 100+ users on shared machine | Each browser profile isolates localStorage. No action needed — by design. |

### Scaling Priorities

1. **First bottleneck: localStorage size.** If historical data across many branches approaches 5 MB, switch Zustand persist storage from `localStorage` to a custom IndexedDB adapter (Zustand supports this via `createJSONStorage` with any async storage). This is a one-line change in the store if architected correctly.
2. **Second bottleneck: calculation performance.** The engine runs synchronously on every render that a feature hook is called. If tables with 12+ months × 3 segments × multiple calcs cause noticeable lag, move heavy calculations into `useMemo` with explicit dependencies to memoize between renders.

## Anti-Patterns

### Anti-Pattern 1: Calculation Logic Inside Components

**What people do:** Write `const rasio = beban / premi` directly in a JSX component.

**Why it's wrong:** Financial formulas scattered across components are impossible to test independently. One off-by-one error in the denominator (e.g., `premi === 0` case) causes a NaN crash only discoverable at runtime. Changes to the formula require finding every instance.

**Do this instead:** All formulas live in `src/engine/`. Components call feature hooks; feature hooks call the engine. The formula is in exactly one place and can be tested with `vitest` without mounting any React component.

### Anti-Pattern 2: Persisting Simulation State

**What people do:** Store what-if overrides in the same Zustand store as real data, or persist them to localStorage alongside real actuals.

**Why it's wrong:** The user's simulation data overwrites their real data. On next page load, the simulated numbers appear as actual inputs. This destroys data integrity and is very hard to explain to a non-technical Pinca.

**Do this instead:** `simulasiStore` is separate from `inputStore` and explicitly NOT decorated with `persist`. What-if state is ephemeral by design — it resets on navigation. If a user wants to "apply" a simulation, they do so explicitly via a dedicated "Terapkan" action that writes to `inputStore`.

### Anti-Pattern 3: Direct localStorage Calls in Components

**What people do:** Call `localStorage.setItem(...)` directly from a component's event handler.

**Why it's wrong:** Bypasses Zustand, creating two sources of truth. State in the store and state in localStorage can diverge, causing bugs that are very hard to reproduce. Also prevents any state middleware (logging, devtools) from working.

**Do this instead:** Components only call Zustand store actions. The persist middleware handles all localStorage writes automatically and synchronously. `lib/storage.ts` provides typed helpers only for explicit one-off reads at startup (e.g., detecting first-run).

### Anti-Pattern 4: Monolithic Global Store

**What people do:** Put all state into a single large Zustand store: profile data, monthly inputs, simulation drafts, UI state (which tab is open), all in one object.

**Why it's wrong:** Every state change triggers re-renders in all consumers of the store. A tab-switch (UI state) causes components that display financial data to re-render unnecessarily. Also, the entire store is serialized to localStorage on every change, including ephemeral UI state.

**Do this instead:** Split stores by concern and persistence requirement. `profilStore` (persisted), `inputStore` (persisted), `simulasiStore` (not persisted), and local `useState` for purely UI state like "which accordion is expanded."

## Integration Points

### External Services

This app has no external services by design (fully offline). All integration is with browser APIs.

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| localStorage | Zustand persist middleware (automatic) | No direct calls from components |
| FileReader API | Wrapped in `lib/xlsx.ts` and `lib/storage.ts` | Used for XLSX + JSON import |
| Blob / file-saver | Called from `features/data` hooks only | Used for XLSX + JSON export |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Components → Store | Zustand hooks (`useInputStore`, `useProfilStore`) | Components never call engine directly |
| Components → Engine | Forbidden — must go via feature hooks | Enforced by convention, not hard constraint |
| Feature hooks → Engine | Direct function calls, pass data as arguments | Pure functions, no side effects |
| Feature hooks → Store | Zustand hooks for reading + actions for writing | |
| Engine → Store | Forbidden — engine has zero dependencies on stores | Keeps engine testable in isolation |
| Data (import/export) → Store | `useInputStore.setState()` bulk-load on import | Validate schema before calling setState |

## Build Order Implications

Based on this architecture, the natural build sequence is:

1. **Engine first** — Pure functions, no dependencies. Can be built and tested before any UI exists. Validates that the BPR formulas are correct before wiring them to any display.
2. **Stores second** — Define data shapes and persistence. Once stores exist, any feature can read from them.
3. **Input forms third** — The entry point for all data. Without inputs, nothing else has data to display.
4. **Dashboard fourth** — Depends on stores having data and engine producing results. Validates end-to-end data flow.
5. **Tables fifth** — Reuses engine output in tabular format; the Excel-replication task.
6. **Charts sixth** — Depends on aggregated data from stores; builds on top of tables layer.
7. **Simulator seventh** — Depends on the engine being stable enough to run with overrides without breaking existing data.
8. **Data management last** — Export/import wraps everything. Build after the data shape is stable to avoid schema churn during development.

## Sources

- Martin Fowler - Modularizing React Applications: https://martinfowler.com/articles/modularizing-react-apps.html (domain layer separation, gateway pattern) — HIGH confidence
- React official docs - Keeping Components Pure: https://react.dev/learn/keeping-components-pure — HIGH confidence
- Robin Wieruch - React Folder Structure in 5 Steps: https://www.robinwieruch.de/react-folder-structure/ (feature-based structure) — HIGH confidence
- Zustand official docs - Persist middleware: https://zustand.docs.pmnd.rs/middlewares/persist — HIGH confidence
- Zustand official docs - Persisting store data: https://zustand.docs.pmnd.rs/integrations/persisting-store-data — HIGH confidence
- State of React 2025 - State Management: https://2025.stateofreact.com/en-US/libraries/state-management/ (Zustand as default state manager) — HIGH confidence
- Profy.dev - React Architecture Business Logic Separation: https://profy.dev/article/react-architecture-business-logic-and-dependency-injection — MEDIUM confidence
- Nucamp - State Management in 2026: https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns — MEDIUM confidence

---
*Architecture research for: Client-side financial calculator SPA (Monitor Beban Pemasaran Cabang Asuransi)*
*Researched: 2026-02-23*
