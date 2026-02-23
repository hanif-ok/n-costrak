# Project Research Summary

**Project:** Calculator Biaya Pemasaran — Monitor Beban Pemasaran Cabang Asuransi
**Domain:** Client-side financial calculator / BPR monitoring dashboard SPA (insurance branch, offline-first)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

This is a specialized compliance tool for Indonesian insurance branch managers (Pinca) at Askrindo, not a generic expense tracker. Its core purpose is to automate the manual, error-prone Excel spreadsheet that branch managers currently use to track three BPR (Business Performance Review) parameters: Beban Nominal (YTD budget vs. actuals), Rasio Beban (expense-to-premium ratio), and Pertumbuhan YoY (year-on-year growth). The tool must operate fully offline, store data in the browser (localStorage), produce Excel-compatible exports, and display everything in Indonesian with Indonesian number formatting. Because no off-the-shelf tool supports Askrindo's BPR evaluation formula, this app replaces a custom Excel — the bar for correctness is "agrees exactly with the Cirebon Excel," not "close enough."

The recommended approach is a React 19 + TypeScript SPA built with Vite 7, styled with Tailwind CSS v4, charted with Recharts 3.7, state-managed with Zustand 5 (persist middleware for localStorage), and file-handled with SheetJS 0.20.3 (installed from the CDN tarball, not npm). The architecture strictly separates the calculation engine (pure TypeScript functions, zero React) from UI components, with Zustand stores as the single source of truth. This separation is non-negotiable: financial formulas must be unit-tested in isolation, and stale closure bugs from mixing calculation logic into React components are a category of bug this domain cannot tolerate. The build should be deployable as either a PWA (web-hosted, offline after first visit) or a single-file HTML (local file:// usage via vite-plugin-singlefile).

The two highest-severity risks are floating-point precision in threshold comparisons (a 0.001% phantom overage triggers a false red alert for a branch manager with real professional consequences) and silent localStorage data loss (the app has no backend; if a write fails silently, the user's only copy of the data is gone). Both risks are cheap to eliminate at the start and catastrophic if deferred. A third risk — SheetJS npm registry version (0.18.5) having two unpatched high-severity CVEs — is avoided by installing from the official CDN tarball (0.20.3). All three risks must be addressed in Phase 1.

## Key Findings

### Recommended Stack

The stack is modern, lean, and proven for this use case. React 19 with TypeScript strict mode handles real-time calculation UX cleanly. Vite 7 provides the fastest development iteration cycle. Tailwind CSS v4's new Vite plugin eliminates PostCSS configuration entirely. Recharts 3.7 resolves the React 19 peer dependency issues that plagued the 2.x line. Zustand 5 with its built-in `persist` middleware is the right state manager at this scale — Redux is overkill for a single-view calculator, and React Context collapses under 12 months × 3 segments × multiple fields. No router library is needed; tab state lives in Zustand.

One critical installation detail: SheetJS must be installed from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, not from the npm registry. The npm registry version is frozen at 0.18.5 with CVE-2023-30533 (prototype pollution) and CVE-2024-22363 (ReDoS). No i18n library is needed — all strings are Bahasa Indonesia hardcoded; `Intl.NumberFormat('id-ID')` and `Intl.DateTimeFormat('id-ID')` cover all locale formatting needs natively.

**Core technologies:**
- React 19.2.4: UI framework — concurrent features handle what-if recalculation without jank
- TypeScript 5.9 (strict mode): Type safety — prevents number/string confusion in currency values
- Vite 7.x: Build tool — fastest HMR; standard greenfield entrypoint in 2026
- Tailwind CSS 4.2.x: Styling — new Vite plugin, zero PostCSS config, 5x faster builds than v3
- Recharts 3.7.0: Charts — React 19 compatible, SVG, built for dashboard-scale data
- SheetJS 0.20.3 (CDN tarball): Excel I/O — only library that reads AND writes real .xlsx/.xls files
- Zustand 5.0.11 + persist middleware: State — no boilerplate, localStorage sync automatic

**Supporting tools:**
- `vite-plugin-pwa 1.1.0`: Service Worker for offline-first delivery
- `vite-plugin-singlefile` (if needed): Inline all assets for local file:// deployment
- Vitest: Unit testing for calculation engine
- `clsx`: Clean conditional Tailwind class composition

### Expected Features

The feature set is clearly two-tiered. Phase 1 (v1) must replace the Cirebon Excel; everything else is valuable but cannot ship until the core BPR calculation is validated by at least one Pinca. The key insight from feature research is that the BPR calculator and the monthly data entry form are co-dependent — neither can ship without the other.

**Must have (table stakes):**
- Monthly data entry form (beban + premi per month, per segment) — the primary input
- BPR calculator: all 3 parameters (Nominal, Rasio, YoY) — the reason the app exists
- Segment breakdown: Non KUR / KUR / Gabungan (auto-sum) — Askrindo evaluates by segment
- RAG status indicators (merah/kuning/hijau) with text labels (not color alone) — core monitoring signal
- Summary KPI cards at top of page — scannable status for Pinca
- YTD cumulative totals — standard budget-tracking expectation
- Trend charts (Beban, Rasio, YoY over months) — visual context
- localStorage persistence with auto-save — app is useless without this
- Indonesian UI and number formatting throughout — non-negotiable for target users
- JSON export/import — offline backup and data recovery mechanism

**Should have (v1.x, add after validation):**
- Mid-month projection (realisasi tgl 1-15 + estimasi tgl 16-31) — high value, builds on verified core
- Projective early warning ("akan melebihi target bulan X") — builds on projection
- What-If simulation (Bagaimana Jika) — sliders with real-time recalculation; isolated from real data
- XLSX export matching Cirebon sheet structure — after JSON export is stable
- Pre/post-revision RKAP support — add when a user encounters a mid-year revision
- Print/PDF report — add when users request for LPJD meetings

**Defer (v2+):**
- Multi-branch profile management — add when more than one branch adopts the tool
- Service Worker / offline PWA caching — add when non-Cirebon branches adopt the tool

**Anti-features to reject permanently:**
- User authentication / login — requires a backend that does not exist
- Real-time sync between branches — out-of-scope infrastructure
- AI recommendations — non-deterministic output is incompatible with compliance use case
- Customizable dashboard layout — non-technical users get confused by moveable widgets

### Architecture Approach

The architecture is a four-layer client-side SPA: UI layer (React components), state layer (Zustand stores), calculation engine (pure TypeScript functions, zero React), and persistence layer (localStorage via persist middleware + file I/O via SheetJS). The critical design constraint is that the calculation engine is completely isolated from React — it accepts plain data and returns plain results, enabling full unit test coverage without rendering. Zustand stores are the single source of truth; components never call localStorage directly. The simulation store is deliberately NOT persisted, so what-if overrides cannot corrupt real data.

**Major components:**
1. Calculation Engine (`src/engine/`) — pure functions for Nominal, Rasio, YoY, Proyeksi, Peringatan; zero React dependencies; fully unit-testable
2. Zustand Stores (`src/store/`) — profilStore (persisted), inputStore (persisted), simulasiStore (NOT persisted)
3. Feature Modules (`src/features/`) — profil, dashboard, tabel, grafik, simulasi, data; each owns its components and hooks
4. Feature Hooks — bridge stores and engine; components call hooks and receive computed results; never call engine directly
5. Persistence Layer — Zustand persist middleware handles localStorage sync; SheetJS and FileReader API handle file I/O; wrapped in `src/lib/`

**Build order implied by architecture:** Engine → Stores → Input Forms → Dashboard → Tables → Charts → Simulator → Data Management. This order is non-negotiable: nothing has data to display until input forms exist, and the simulator cannot be built safely until the engine is stable.

### Critical Pitfalls

1. **Floating-point precision in BPR threshold comparisons** — Store all monetary values as integers (whole rupiah); perform ratio division last; use `Math.round(value * 100) / 100` before any threshold comparison; use `Decimal.js` or `big.js` for multi-step projection chains. Address in Phase 1 before any calculation code is written; write unit tests for exact threshold boundary values.

2. **Silent localStorage data loss** — Wrap every `localStorage.setItem()` in try/catch; surface Indonesian-language error on QuotaExceededError; show "Tersimpan otomatis [waktu]" status; detect private/incognito mode on start. Export (JSON) must ship before persistence is relied upon by users.

3. **XLSX binary file corruption via wrong FileReader API** — Always use `FileReader.readAsArrayBuffer()` for .xlsx files (never `readAsText()`); then `XLSX.read(new Uint8Array(buffer), { type: 'array' })`. Write an integration test that round-trips a known XLSX fixture.

4. **Division by zero in projection and Rasio calculations** — Guard every division: if `daysElapsed === 0` or `premi === 0`, display "N/A" (not Infinity). Define explicit empty/zero states for every calculation before writing formula code. Test January with no prior-year data, day 1 of month with no data entered.

5. **Simulation state leaking into real data** — `simulasiStore` must NOT use persist middleware. Apply a "MODE SIMULASI" visual banner whenever simulation is active. Simulation overrides must be discarded on navigation; "Terapkan" action is the only path to write simulation values to `inputStore`.

## Implications for Roadmap

Based on combined research, the architecture's explicit build order and the feature dependency graph map directly to phases. The architecture research provides the most actionable guidance here: engine before stores, stores before forms, forms before dashboard.

### Phase 1: Mesin Kalkulasi dan Input Data Inti (Core Calculator + Data Entry)

**Rationale:** The calculation engine and monthly data entry form are co-dependent — neither is useful without the other. More importantly, floating-point precision and division-by-zero must be established as invariants before any downstream code relies on calculation output. This phase validates the fundamental correctness of the BPR formulas.

**Delivers:** A working, tested BPR calculator for all 3 parameters (Nominal, Rasio, YoY) across all 3 segments (Non KUR, KUR, Gabungan), wired to a monthly data entry form, with localStorage persistence and Indonesian number formatting. Core unit tests for all threshold boundary values.

**Addresses features:** Branch profile input, monthly data entry form, BPR calculator (3 parameters), segment breakdown, YTD cumulative totals, localStorage persistence, Indonesian UI + number formatting, JSON export (as safety net before persistence ships to users).

**Avoids pitfalls:** Floating-point drift (integer storage + explicit rounding established as convention here), division by zero in Rasio and YoY (guarded from day one), silent localStorage loss (try/catch + error surfacing), RKAP revision complexity (base RKAP only; revision deferred to v1.x).

**Research flag:** Standard patterns — calculation engine architecture is well-documented; no additional research needed.

### Phase 2: Dasbor dan Visualisasi (Dashboard + Charts)

**Rationale:** Once the engine produces correct results and stores contain data, the dashboard is a pure rendering concern. RAG status indicators, KPI cards, and trend charts all derive from Phase 1 outputs and add zero new data complexity. This phase validates the end-to-end data flow visually.

**Delivers:** Dashboard page with RAG status cards (KPI tiles per parameter per segment), trend charts (Recharts), empty-state onboarding guidance for new users, and Indonesian number formatting applied to all displayed values.

**Addresses features:** RAG status indicators (with text labels, not color alone), summary KPI cards, trend charts, empty onboarding state.

**Avoids pitfalls:** Indonesian number format inconsistency (all chart tooltips and axis formatters use `Intl.NumberFormat('id-ID')`), color-blind accessibility (text labels alongside RAG colors), empty state confusion (guided onboarding shown when localStorage has no data).

**Uses:** Recharts 3.7, Tailwind CSS v4, Zustand selectors feeding feature hooks.

**Research flag:** Standard patterns — Recharts dashboard patterns are well-documented.

### Phase 3: Tabel Data dan Ekspor/Impor (Data Tables + Export/Import)

**Rationale:** Replicating the Excel table structure (TabelNominal, TabelRasio, TabelYoY) gives Pinca a familiar reference. XLSX export must ship together because users expect to hand off data as a spreadsheet — it is the primary deliverable format for LPJD meetings. JSON import/export provides backup before XLSX is complete.

**Delivers:** Tabular views mirroring the Cirebon Excel structure, XLSX export via SheetJS (matching Cirebon column structure), JSON export/import, print stylesheet.

**Addresses features:** Data tables (Excel-equivalent view), XLSX export, JSON export/import, print/printable report.

**Avoids pitfalls:** SheetJS binary corruption (readAsArrayBuffer enforced, integration test with known fixture), XLSX column order assumption (map by header name, not column index), SheetJS CVE (version 0.20.3 from CDN tarball).

**Uses:** SheetJS 0.20.3 (CDN tarball), FileReader API, `src/lib/xlsx.ts` wrapper, `src/lib/storage.ts`.

**Research flag:** Needs attention — XLSX column mapping to match Cirebon sheet structure exactly requires validation with a real Cirebon file. Recommend testing against an actual export from the existing Excel during development.

### Phase 4: Proyeksi Paruh Bulan dan Peringatan Dini (Mid-Month Projection + Early Warning)

**Rationale:** This phase adds the differentiating intelligence on top of the validated calculator. Mid-month projection (tgl 1-15 actuals + tgl 16-31 estimate) and projective early warning ("akan melebihi target bulan X") are high-value features that build directly on the projection engine. They must come after Phase 1 is validated by a Pinca because they extend calculation logic — any formula error here compounds on the base calculator.

**Delivers:** Paruh-bulan input flow, projection display on dashboard, "akan melebihi" early warning alerts in Indonesian, peringatan thresholds wired to existing RAG system.

**Addresses features:** Mid-month projection, projective early warning.

**Avoids pitfalls:** Division by zero in projection (daysElapsed guard, explicit "Belum ada data bulan ini" state), NaN propagation into YTD (detect and substitute 0 on load, never persist NaN), RKAP revision affecting projection calculations.

**Research flag:** Moderate complexity — projection formula for paruh-bulan (extrapolation method) should be confirmed against how the Cirebon Excel currently estimates the second half of the month.

### Phase 5: Simulasi "Bagaimana Jika" (What-If Simulation)

**Rationale:** Simulation is isolated from earlier phases by design (simulasiStore is separate and ephemeral). It must come after projection is stable because simulation uses the same engine functions with override data. Shipping simulation before the engine is proven introduces risk that simulation bugs are mistaken for calculator bugs.

**Delivers:** What-If simulation panel with sliders/inputs, real-time recalculation using `simulasiStore` overrides, "MODE SIMULASI" visual banner, "Terapkan" action to optionally commit simulation values to real data.

**Addresses features:** What-If simulation (Bagaimana Jika).

**Avoids pitfalls:** Simulation state leaking into real data (simulasiStore not persisted, visual differentiation mandatory), conflation of simulation results with actual projection (separate panel with clear labeling).

**Research flag:** Standard patterns — what-if simulation with ephemeral state override is well-documented in Zustand patterns.

### Phase 6: Fitur Lanjutan (Advanced / v1.x Features)

**Rationale:** RKAP revision support and multi-branch profile management add data model complexity that is easier to introduce after the core data shape is stable. These features are deferred intentionally — RKAP revision is only needed when a user encounters a mid-year revision, and multi-branch is only needed when more than one branch uses the tool.

**Delivers:** Pre/post-revision RKAP support (store RKAP_awal and RKAP_revisi, apply correct version by month), multi-branch profile management (named profiles in localStorage, profile switcher UI, export-before-switch guard).

**Addresses features:** RKAP pre/post-revision, multi-branch profile management, Service Worker / offline PWA caching (if non-Cirebon branches adopt).

**Research flag:** RKAP revision logic — how Askrindo defines which months use original vs. revised RKAP needs domain confirmation. This is a compliance rule that cannot be inferred from generic research.

### Phase Ordering Rationale

- Engine before stores before forms before dashboard: imposed directly by the architecture's build order and the feature dependency graph (BPR calculator requires monthly form data; dashboard requires BPR calculator output).
- Data tables and export ship together in Phase 3 (not separate phases) because XLSX export and tabular views share the same data shape; splitting them creates schema churn.
- Projection (Phase 4) before simulation (Phase 5) because simulation reuses the projection engine — a stable engine is a prerequisite.
- Advanced features last because they modify the data model; changing the model mid-build causes migration work in localStorage and store shape.
- Floating-point precision established in Phase 1 as a code convention, not retrofitted — this is the single highest-leverage risk mitigation in the entire project.

### Research Flags

Phases needing deeper research or domain validation during planning:
- **Phase 3 (XLSX export):** Validate column mapping against a real Cirebon Excel file. The exact sheet structure must match what Pinca already know. This is a domain-specific detail that cannot be researched generically.
- **Phase 4 (Projection formula):** Confirm the paruh-bulan extrapolation method with Pinca or examine the Cirebon Excel formula. Two plausible methods exist (linear daily average vs. weighted estimate); the wrong choice produces numbers that disagree with what Pinca expect.
- **Phase 6 (RKAP revision):** The rule governing which months use original vs. revised RKAP is an Askrindo compliance rule. It must be confirmed with a domain expert before implementation.

Phases with standard, well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1:** BPR calculator architecture, Zustand store setup, integer math patterns — all HIGH-confidence, well-documented.
- **Phase 2:** Recharts dashboard patterns, Tailwind v4 component styling — standard.
- **Phase 5:** What-if simulation with ephemeral Zustand store — established pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core libraries verified via official release pages and WebFetch; SheetJS CVE data verified via Snyk/GitHub advisories; version compatibility matrix explicitly checked |
| Features | MEDIUM-HIGH | Feature list derived from domain analysis of BPR evaluation context; no direct competitor to benchmark against; anti-feature list is opinionated but well-reasoned for the specific constraints |
| Architecture | HIGH | Patterns sourced from Martin Fowler, official React docs, Zustand official docs, Robin Wieruch — all established, frequently-cited sources; build order is deterministic from dependency graph |
| Pitfalls | HIGH (technical), MEDIUM (UX) | Technical pitfalls (floating-point, XLSX binary API, localStorage quota) sourced from MDN, Snyk, and SheetJS official docs; UX pitfalls sourced from dashboard design literature with MEDIUM confidence |

**Overall confidence:** HIGH

### Gaps to Address

- **Cirebon Excel schema:** The exact column structure of the existing Cirebon Excel has not been examined. XLSX export must replicate it exactly. Obtain the actual file before Phase 3 implementation begins.
- **BPR formula parameters:** The exact Askrindo-defined thresholds (what constitutes "merah" vs. "kuning" for each parameter) are not sourced in the research. These are compliance rules that must be confirmed with a Pinca or Askrindo documentation before Phase 1 formula code is written.
- **Paruh-bulan extrapolation method:** Whether the Cirebon Excel projects the second half of the month as a simple daily average, a weighted estimate, or a different method is unknown. Confirm before Phase 4.
- **RKAP revision rules:** Which months use original vs. revised RKAP after a mid-year revision — confirm with domain expert before Phase 6.
- **Deployment mode:** Whether the app will be deployed as a web-hosted PWA or as a local file (file:// protocol) determines whether `vite-plugin-singlefile` is required and whether standard routing works. This should be decided before Phase 1 scaffolding.

## Sources

### Primary (HIGH confidence)
- React 19.2 release blog — https://react.dev/blog/2025/10/01/react-19-2
- Vite 7.0 announcement — https://vite.dev/blog/announcing-vite7
- Tailwind CSS v4.0 stable — https://tailwindcss.com/blog/tailwindcss-v4
- SheetJS official docs (React integration, installation) — https://docs.sheetjs.com/
- SheetJS CVE-2023-30533 — https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
- SheetJS CVE-2024-22363 — https://security.snyk.io/vuln/SNYK-JS-XLSX-6252523
- Recharts 3.7.0 release + React 19 issue resolution — https://github.com/recharts/recharts/releases
- Zustand official docs (persist middleware) — https://zustand.docs.pmnd.rs/middlewares/persist
- Martin Fowler — Modularizing React Applications — https://martinfowler.com/articles/modularizing-react-apps.html
- React official docs — Keeping Components Pure — https://react.dev/learn/keeping-components-pure
- Robin Wieruch — React Folder Structure in 5 Steps — https://www.robinwieruch.de/react-folder-structure/
- MDN — Storage quotas and eviction — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN — Intl.NumberFormat — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

### Secondary (MEDIUM confidence)
- State of React 2025 — State Management — https://2025.stateofreact.com/en-US/libraries/state-management/
- Zustand 5.0.11 npm — https://www.npmjs.com/package/zustand
- vite-plugin-pwa 1.1.0 — https://www.npmjs.com/package/vite-plugin-pwa
- TypeScript 5.9 — https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- Robin Wieruch — JavaScript Rounding Errors in Financial Applications
- ClearPoint Strategy — RAG Status for KPI Management
- Effective Dashboard Design Principles 2025 — UXPin

### Tertiary (LOW confidence, pattern guidance only)
- RipenApps — 10 Must-Have Features of Expense Tracking App (general, not insurance-specific)
- Medium — Offline-First App Development Guide (pattern guidance)

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
