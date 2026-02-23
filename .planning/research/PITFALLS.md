# Pitfalls Research

**Domain:** Client-side financial calculator/dashboard (insurance branch expense monitoring)
**Researched:** 2026-02-23
**Confidence:** HIGH (floating-point, XLSX, localStorage), MEDIUM (Indonesian locale edge cases, non-technical UX patterns)

---

## Critical Pitfalls

### Pitfall 1: Floating-Point Drift in Ratio and YoY Calculations

**What goes wrong:**
JavaScript's IEEE 754 floating-point arithmetic produces silent rounding errors in percentage calculations. `0.1 + 0.2 === 0.30000000000000004`. For BPR ratios (beban / premi), this drift accumulates across 12 months of YTD summing. A ratio displayed as "5.13%" may internally be 5.1300000000000009%, causing threshold comparisons (is ratio >= 5%?) to flip incorrectly. YoY growth comparisons are especially vulnerable because they divide two already-accumulated floats.

**Why it happens:**
Developers treat JavaScript `number` as "close enough" for percentages. This is acceptable in most apps but wrong in financial compliance tools where a branch head may be evaluated against a threshold like "rasio tidak boleh melebihi 5%". A 0.001% phantom overage triggers a false red warning.

**How to avoid:**
- Store all monetary values (beban, premi, anggaran) as integers in the smallest practical unit (e.g., whole rupiah — IDR has no subunit). Do not store as floats.
- For ratio calculations (beban / premi * 100), perform division last and round explicitly to 2 decimal places using `Math.round(value * 100) / 100` before any threshold comparison.
- For YoY growth: `Math.round(((thisYear - lastYear) / lastYear) * 10000) / 100` — multiply before dividing.
- Use `Decimal.js` or `big.js` if multi-step intermediate calculations are required (e.g., the paruh-bulan projection chain). These libraries prevent IEEE 754 drift entirely.
- **Never compare raw floats to thresholds.** Always round both sides to the same precision first.

**Warning signs:**
- A ratio shows "5.000000000001%" or rounds incorrectly in display
- Adding 12 monthly values produces a YTD that differs from a row-by-row sum by >0
- Unit tests for threshold crossing (hijau/kuning/merah) fail intermittently with boundary values
- The app's running total disagrees with an equivalent Excel SUM by a few rupiah

**Phase to address:** Phase 1 (core calculator logic) — establish integer-first storage and explicit rounding functions before any other calculation code is written. Write unit tests for boundary values (exactly at threshold) in the same phase.

---

### Pitfall 2: XLSX Import Corrupts Binary File Data

**What goes wrong:**
When reading user-uploaded `.xlsx` files, using `FileReader#readAsText` corrupts binary spreadsheet data. The SheetJS library requires `FileReader#readAsArrayBuffer` for binary formats. Using the wrong reader produces silently wrong data — the parse may "succeed" but cells contain garbage, or rows are missing.

**Why it happens:**
Developers familiar with CSV import copy that pattern (text-based) to XLSX import without reading SheetJS documentation carefully. The bug is non-obvious: no error is thrown, the workbook object is returned, but the data is corrupt.

**How to avoid:**
```javascript
// WRONG — corrupts binary xlsx
reader.readAsText(file);

// CORRECT
reader.readAsArrayBuffer(file);
// Then: XLSX.read(new Uint8Array(event.target.result), { type: 'array' })
```
Always use `readAsArrayBuffer` for `.xlsx`, `.xls`, `.xlsb`. Only use `readAsText` for `.csv`.

**Warning signs:**
- Import appears to succeed but cell values are empty or contain replacement characters (``)
- Numbers import as `NaN` or strings instead of numeric values
- File parses without error but sheet has zero rows

**Phase to address:** Phase 4 (ekspor/impor data) — write an integration test that round-trips a known XLSX fixture through import and verifies cell values exactly match expected output.

---

### Pitfall 3: localStorage Data Loss Without Warning

**What goes wrong:**
All application data lives in `localStorage`. Three separate failure modes cause silent data loss:

1. **Quota exceeded (5–10 MB limit):** When storage is full, `localStorage.setItem()` throws a `QuotaExceededError` DOMException. If uncaught, the save silently fails — the user sees no error and continues working, then loses all unsaved changes on refresh.
2. **Browser eviction:** Under storage pressure (low disk), browsers apply a Least Recently Used policy and evict origin data without warning. This is rare but catastrophic for an app with no server backup.
3. **Private/incognito mode:** In some browsers, `localStorage` is disabled or has 0-byte quota in private browsing. The app crashes or behaves unpredictably.

**Why it happens:**
localStorage is treated as "just like a variable." Developers don't wrap writes in try/catch, don't test storage limits, and don't consider that the data stored is the only copy.

**How to avoid:**
- Wrap every `localStorage.setItem()` in try/catch and surface a visible Indonesian-language error: "Penyimpanan penuh. Ekspor data Anda segera."
- Implement a "last saved" timestamp displayed in the UI so users know if data is persisted.
- Encourage (and make easy) regular JSON/XLSX export as a backup — this is the primary recovery mechanism given no backend.
- Cap stored data size: for a single-branch monthly dataset (12 months × 2 segments × ~10 fields), data should be well under 100 KB. If data grows toward 1 MB, alert the user.
- Detect private mode on app start and show a banner: "Mode penyamaran terdeteksi — data tidak akan tersimpan."

**Warning signs:**
- Users report "data saya hilang" after closing and reopening the browser
- Console shows `QuotaExceededError` in production error logs
- Multi-branch profiles accumulate historical data year-over-year toward the 5 MB limit

**Phase to address:** Phase 3 (penyimpanan data) — implement defensive save wrapper with error handling before any feature relies on persistence. Phase 4 (ekspor/impor) must be completed before Phase 3 ships to users, so backup mechanism exists.

---

### Pitfall 4: Mid-Month Projection Division by Zero and Invalid States

**What goes wrong:**
The paruh-bulan projection feature (realisasi tgl 1-15 + estimasi tgl 16-31) divides by the number of days elapsed. On the first day of the month (day 1), or when a user enters the app before entering any data for the current month, the elapsed-day denominator is zero or near-zero. Division produces `Infinity` or `NaN`, which then propagates into YTD totals, ratio calculations, and chart rendering — causing the entire dashboard to display `NaN` or crash.

**Why it happens:**
Projection formulas are written for the "happy path" (mid-month, data entered). Edge cases at month boundaries are not considered during design.

**How to avoid:**
- Guard every projection division: `const projected = daysElapsed > 0 ? (actual / daysElapsed) * totalDays : 0`
- Define explicit UI states: "Belum ada data bulan ini" shown when realisasi for current month is zero — do not project from zero.
- When premi is zero (new branch, no premium income yet), the rasio calculation (beban/premi) is undefined — display "N/A" not "Infinity".
- Write explicit test cases: month=1, no data entered; month=12, partial data; all-zero input; premi=0.

**Warning signs:**
- Dashboard shows `NaN`, `Infinity`, or blank cards in January or at month start
- YTD total shows negative or astronomically large value
- Chart rendering fails or shows a spike to maximum Y-axis value

**Phase to address:** Phase 1 (core calculator) — define the zero/null/empty state for every calculation before the first line of formula code. Validate with the Cirebon sample data for all 12 months.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Raw `number` for all monetary values | No library needed, fast start | Ratio threshold comparisons fail at boundaries; YTD drift accumulates | Never — integers cost nothing to implement from the start |
| Single `localStorage` key for all data | Simple to implement | 5 MB limit hit faster; atomic save means partial corruption possible | Only for MVP prototype, refactor before shipping to users |
| No input validation on XLSX import | Faster to build | Malformed files crash the app; wrong column order silently imports garbage | Never — at minimum validate column headers before processing |
| Hardcode current year in YoY logic | Simpler initial code | Breaks in January of new year; YoY vs prior year uses wrong baseline | Never — use `new Date().getFullYear()` from day one |
| Skip `try/catch` on localStorage writes | Less boilerplate | Silent data loss on quota exceeded | Never — one line of catch prevents catastrophic loss |
| Display raw `number.toFixed(2)` without locale | Works in dev environment | Displays `5.13` with period decimal separator instead of `5,13` as required in Indonesian locale | Never — use Intl.NumberFormat from day one |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SheetJS XLSX import | `FileReader.readAsText(file)` — corrupts binary format | `FileReader.readAsArrayBuffer(file)` → `XLSX.read(new Uint8Array(buffer), {type: 'array'})` |
| SheetJS XLSX export | Generating filename without extension, relying on content-type | Always append `.xlsx` to filename explicitly; use `XLSX.writeFile()` not raw blob download |
| SheetJS column mapping | Assuming column order matches after re-save in different Excel version | Map by header name (`A1`, `B1` cell values), not by column index |
| SheetJS number cells | Excel stores currency as number+format; importing gives raw float (e.g., 1234567.89) | After import, round to integer rupiah: `Math.round(cellValue)` |
| Recharts tooltip formatting | Default tooltip shows raw `number` (e.g., `1234567.89`) | Pass custom `formatter` prop using `Intl.NumberFormat('id-ID')` to all `<Tooltip>` and `<YAxis tickFormatter>` |
| Recharts Y-axis with Indonesian numbers | Default uses `k`/`M` abbreviations (English) | Implement custom `tickFormatter` that outputs `Rp 1,2 Jt` or full `123.456.789` depending on scale |
| localStorage multi-key vs single-key | Single JSON blob: atomic but hard to migrate schema | Use namespaced keys (`askrindo_v1_cabang_001`, `askrindo_v1_rkap_2025`) for granular access and versioning |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recalculating all 12 months on every input keystroke | UI freezes during "Bagaimana Jika" simulation typing | Debounce simulation inputs by 300ms; memoize monthly base calculations with `useMemo` | With 3 segments × 12 months × multiple formulas, noticeable lag at ~50 calculations per keystroke |
| Re-rendering entire chart on every state change | Chart animation plays repeatedly, flickering during data entry | Isolate chart components; use `React.memo` on chart wrapper; only update chart on blur/submit | Noticeable immediately on low-end devices (budget Android tablets used by some Pinca) |
| Parsing XLSX file synchronously on main thread | UI freezes during import | Use FileReader async API (it is already async); SheetJS parse is synchronous — show loading spinner, avoid blocking >500ms | Files with >500 rows / multiple sheets |
| Storing entire historical dataset in one localStorage read | Slow initial load; parse delay | Keep current-year data in fast key; archive prior years to separate key loaded on demand | Multi-year data after 3+ years of use |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Parsing user-uploaded XLSX without size limit | Prototype Pollution (CVE-2023-30533), ReDoS (CVE-2024-22363), browser crash on malformed file | Validate file size before parsing (`file.size < 5_000_000`); use SheetJS version from official registry (not npm `xlsx@0.18.x`); wrap `XLSX.read()` in try/catch |
| Storing branch financial data in unencrypted localStorage | Data visible to any script on the page (XSS risk); data visible to other users on shared computers | Add "Keluar / Hapus Data" button that clears localStorage; display warning in onboarding: "Jangan biarkan orang lain menggunakan perangkat ini tanpa menutup aplikasi" |
| Trusting imported JSON data structure without validation | Malformed JSON from edited export files can corrupt app state | Validate imported JSON against a schema (check required keys, value types) before writing to state |

Note: This is a standalone client-side tool with no auth and no server. The security surface is limited, but shared-device usage is realistic for Indonesian branch offices.

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Using English terms in any UI element | Pinca reads "Budget", "YoY", "Dashboard" — confusion; loses trust in the tool | Every label, button, error message, tooltip, and placeholder must be in Indonesian. Use "Anggaran" not "Budget"; "Pertumbuhan YoY" not "YoY Growth"; "Dasbor" not "Dashboard" |
| Showing raw numbers without Indonesian formatting | `1234567` is unreadable to Indonesian users; they expect `1.234.567` | Use `new Intl.NumberFormat('id-ID')` for all number displays; use `Rp 1.234.567` for currency; use `5,13%` (comma decimal) for percentages |
| Threshold colors (merah/kuning/hijau) without text label | Color-blind Pinca cannot distinguish warning states | Always pair color with text label: show "MELEWATI BATAS", "MENDEKATI BATAS", "AMAN" alongside the color — never rely on color alone |
| Requiring users to "Save" manually | Excel users expect auto-save behavior; non-IT users forget to save; data loss on accidental tab close | Auto-save to localStorage on every meaningful state change (debounced 1s); show "Tersimpan otomatis [waktu]" in status bar |
| Hiding import/export behind menus | Pinca's primary use case is exporting for monthly reports; if export is buried, they won't find it | Put "Ekspor ke Excel" button prominently on the dashboard — not inside a hamburger menu or settings page |
| Decimal input with period separator in number fields | Indonesian users type `1.234,56` — a period-formatted input field rejects their natural entry | Accept both `.` and `,` as decimal separator in input fields; strip thousands separators on parse; display back in Indonesian format |
| Empty state shows blank charts with no guidance | New user sees empty charts, no idea how to start | Show explicit onboarding empty state: "Mulai dengan mengisi Profil Cabang dan RKAP di menu Pengaturan" with a direct link/button |
| Simulation ("Bagaimana Jika") changes affect real data | User experiments with simulation values, accidentally overwrites actual realisasi | Keep simulation state isolated from real data state; clearly label simulation mode with visual differentiation (e.g., yellow border, "MODE SIMULASI" banner) |

---

## "Looks Done But Isn't" Checklist

- [ ] **Number formatting:** All numbers display with Indonesian separators (`.` thousands, `,` decimal) — verify in chart tooltips, table cells, summary cards, AND exported XLSX. It is easy to fix display but forget charts.
- [ ] **XLSX round-trip:** Import a file, export it, re-import the export — verify values match exactly. Catches float-to-integer drift introduced during export formatting.
- [ ] **Offline after first load:** Open app, disable network (DevTools → Offline), reload page — app must fully function. Verify with Chrome DevTools Service Worker panel that all assets are cached.
- [ ] **Edge month states:** Enter January with zero prior-year data — YoY must show "N/A" not divide-by-zero. Enter data for day 1 of month — projection must not crash.
- [ ] **Multi-cabang switching:** Switch between two branch profiles — verify data from Branch A does not leak into Branch B display.
- [ ] **localStorage quota warning:** Fill storage manually (use DevTools to set quota to 1 MB), attempt to save — verify Indonesian-language error message appears.
- [ ] **RKAP revisi:** Change RKAP from original to revised mid-year — verify YTD target recalculates correctly for prior months (should use original RKAP) vs. future months (revised RKAP).
- [ ] **Gabungan = Non KUR + KUR:** Verify Gabungan segment is always auto-computed, never manually entered — reject any import that provides Gabungan values that don't match the sum.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Float precision error discovered in production | HIGH | Audit all stored localStorage values; write migration that re-rounds integers; force users to re-verify one month of data |
| localStorage data lost (quota exceeded, eviction) | HIGH if no export was made; LOW if user had exported | Instruct user to use most recent XLSX export as source; re-import; data since last export is lost |
| XLSX import corrupted data (wrong FileReader API) | MEDIUM | Add validation layer; prompt user to re-import original file; show diff of what changed |
| Mid-month projection NaN propagates into saved state | MEDIUM | Detect NaN/Infinity in stored values on load; substitute 0 with a visible warning; do not persist NaN |
| Indonesian locale not applied consistently to charts | LOW | Systematic search for all `toFixed()`, `toString()`, raw number renders; replace with central `formatAngka()` utility function |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Floating-point precision in BPR calculations | Phase 1: Core calculator | Unit tests with boundary threshold values (exactly at 5%, 100%, 0% YoY); compare output to Cirebon sample data |
| Division by zero in projection and rasio | Phase 1: Core calculator | Test with zero premi, zero elapsed days, January with no prior-year data |
| XLSX binary corruption (wrong FileReader) | Phase 4: Ekspor/impor | Integration test: import known XLSX → compare all cell values to expected JSON |
| XLSX column order assumption | Phase 4: Ekspor/impor | Test import of re-saved file from different Excel versions; test with reordered columns |
| localStorage quota exceeded without feedback | Phase 3: Penyimpanan data | Manual test: fill quota, attempt save, verify Indonesian error message appears |
| localStorage data loss (no backup) | Phase 4: Ekspor/impor | Verify export is available before Phase 3 ships; confirm round-trip accuracy |
| Indonesian number format inconsistency | Phase 2: Dasbor (first display) | Visual regression: screenshot all number-bearing elements; verify no period as decimal separator |
| Simulation state leaks into real data | Phase 5: Simulasi "Bagaimana Jika" | Toggle simulation on/off; verify real data state is unchanged; check localStorage before/after simulation |
| Empty onboarding state confusion | Phase 2: Dasbor | Test with fresh localStorage (no data); verify guided empty state appears |
| RKAP revisi affecting historical months | Phase 1: Core calculator | Test: set original RKAP, enter 6 months data, change to revised RKAP — verify months 1-6 still use original |
| SheetJS security vulnerabilities (CVE-2023-30533, CVE-2024-22363) | Phase 4: Ekspor/impor | Pin SheetJS to >= 0.20.2 from official registry; add file size check before parse |

---

## Sources

- [JavaScript Rounding Errors in Financial Applications — Robin Wieruch](https://www.robinwieruch.de/javascript-rounding-errors/)
- [Handling Currency and Financial Calculations with JavaScript Numbers — Sling Academy](https://www.slingacademy.com/article/handling-currency-and-financial-calculations-with-javascript-numbers/)
- [SheetJS Troubleshooting and Common Errors — Official Docs](https://docs.sheetjs.com/docs/miscellany/errors/)
- [SheetJS Data Import — Official Docs](https://docs.sheetjs.com/docs/solutions/input/)
- [Prototype Pollution CVE-2023-30533 in SheetJS — Snyk](https://security.snyk.io/vuln/SNYK-JS-XLSX-5457926)
- [ReDoS CVE-2024-22363 in SheetJS — Snyk](https://security.snyk.io/vuln/SNYK-JS-XLSX-6252523)
- [Storage Quotas and Eviction Criteria — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Offline Storage for PWAs — LogRocket Blog](https://blog.logrocket.com/offline-storage-for-pwas/)
- [Understanding and Resolving localStorage Quota Exceeded Errors — Medium](https://medium.com/@zahidbashirkhan/understanding-and-resolving-localstorage-quota-exceeded-errors-5ce72b1d577a)
- [Intl.NumberFormat — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [NPM + SheetJS XLSX in 2026: Safe Installation and Secure Parsing — TheLinuxCode](https://thelinuxcode.com/npm-sheetjs-xlsx-in-2026-safe-installation-secure-parsing-and-real-world-nodejs-patterns/)
- [Effective Dashboard Design Principles 2025 — UXPin](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Financial Reporting UX Best Practices — NumberAnalytics](https://www.numberanalytics.com/blog/financial-reporting-ux-best-practices)
- [Why Dashboards Fail — Orbix Studio / Medium](https://medium.com/@orbix.studiollc/why-dashboards-fail-and-how-thoughtful-ux-can-turn-data-into-demand-7b5d88b283c3)
- [Using localStorage in Modern Applications — RxDB](https://rxdb.info/articles/localstorage.html)
- [Recharts formatting number with commas — GitHub Issue #1534](https://github.com/recharts/recharts/issues/1534)
- [Chart.js Intl number format — GitHub Issue #7921](https://github.com/chartjs/Chart.js/issues/7921)

---
*Pitfalls research for: client-side financial calculator / insurance branch expense monitoring (Monitor Beban Pemasaran Cabang Asuransi)*
*Researched: 2026-02-23*
