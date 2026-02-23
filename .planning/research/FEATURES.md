# Feature Research

**Domain:** Client-side financial monitoring dashboard — insurance branch marketing expense tracking
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH

---

## Context Notes

This is not a general-purpose expense tracker. It is a specialized BPR (Business Performance Review)
parameter calculator for Indonesian insurance branch managers (Pinca). Users are non-technical,
Excel-accustomed, and face real professional consequences if they miss budget thresholds. The app
replaces a manual spreadsheet; it does not compete with SaaS tools.

Feature categorization below distinguishes between:
- What non-technical dashboard users universally expect (table stakes)
- What differentiates this tool from the Excel it replaces (differentiators)
- What to avoid even though it feels natural to add (anti-features)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Budget vs. Actual comparison per period | Standard in every financial monitoring tool; users are confused without it | LOW | Must show YTD actual vs. YTD target for each of the 3 BPR parameters |
| RAG (Red/Amber/Green) status indicators | Universal convention for KPI health; users read color before numbers | LOW | Green = within budget, Amber = approaching limit (e.g. >80%), Red = exceeded |
| Summary cards / KPI tiles at top of page | Every modern dashboard leads with scannable headline numbers | LOW | One card per BPR parameter per segment (Non KUR, KUR, Gabungan) |
| Monthly data input form | Users need a structured way to enter realisasi (actuals) for each month | LOW | Must mirror Excel column structure; one row per month |
| YTD cumulative totals | Standard in budget tracking; users track year-to-date burn rate | LOW | Auto-calculated from monthly inputs |
| Trend chart (line/bar) over time | Visual context for numbers is expected in any monitoring app | MEDIUM | Beban, Rasio, YoY growth trends per month |
| Data persistence between sessions | App is useless if data resets on every visit | LOW | localStorage as primary; must survive browser refresh |
| Indonesian language UI | Users are Indonesian-speaking non-IT professionals; English UI causes confusion | LOW | 100% Bahasa Indonesia; no English labels |
| Indonesian number formatting | Dot-thousand separator, comma-decimal (1.234.567,89) is non-negotiable for local users | LOW | Wrong format causes trust issues with calculations |
| Export to Excel/XLSX | Target users live in Excel; they expect to hand off data as a spreadsheet | MEDIUM | SheetJS handles this; replicate the Cirebon sheet structure |
| Print / printable report | Managers may need to print a summary for physical LPJD meetings | LOW | CSS print stylesheet or browser print trigger; minimal complexity |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required by generic dashboards, but high value here.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3-Parameter BPR calculator (Nominal + Rasio + YoY) | This specific combination does not exist in any off-the-shelf tool; it is the core reason the app exists | MEDIUM | Must calculate each parameter correctly per Askrindo evaluation formula |
| Mid-month projection (tanggal 1-15 + estimasi 16-31) | Gives Pinca actionable data before month closes; the Excel already does this — the app must do it better | MEDIUM | Input first-half actuals, estimate second-half; auto-project full-month result |
| Projective early warning ("will exceed in month X") | Moves the tool from reactive to proactive; core value proposition | MEDIUM | Based on current YTD burn rate + monthly projection trend |
| What-If simulation (Bagaimana Jika) | Lets Pinca model "what if I spend X more this month?" before committing; very high value for planning | MEDIUM | Sliders or input fields with real-time recalculation; no server needed |
| Segment breakdown (Non KUR / KUR / Gabungan) | Askrindo evaluates each segment separately; flat total is insufficient | LOW | Three tabs or sections; Gabungan auto-sums Non KUR + KUR |
| Pre/post-revision RKAP support | Budgets are revised mid-year in Indonesian corporate planning; tool must handle both versions | MEDIUM | Store RKAP_awal and RKAP_revisi; user selects which applies to current calculation |
| Multi-branch profile management | One device may track multiple branches (relief managers, regional staff) | LOW | Named profiles in localStorage; switch without losing data |
| Offline-first (works after first load) | Branches outside Java often have unreliable internet; offline capability is a hard constraint | MEDIUM | Service Worker + cache; React SPA with no external API calls |
| JSON import/export for backup and transfer | Without a server, data portability requires file-based backup; also enables sharing between staff | LOW | Simple JSON.stringify/parse; standard pattern for offline apps |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User authentication / login | "Security" and multi-user access feel like standard features | No backend exists; adding auth means adding a server, violating the no-backend constraint. Also unnecessary — each branch operates independently | Store named profiles in localStorage; no access control needed |
| Real-time sync between branches | Central visibility feels useful | Requires backend infrastructure, network dependency, and data governance that are out of scope. The app is intentionally standalone per branch | JSON export/import for manual transfer; each branch manages its own data |
| AI-powered recommendations / NLP | Trend in 2025-2026 financial dashboards | Requires API calls (network dependency), adds complexity, and the users need deterministic calculations for compliance — not AI suggestions | Clear threshold-based alerts with plain-language messages in Indonesian |
| Receipt/document scanning (OCR) | Common in expense tracker apps | This tool tracks budget allocations and aggregates, not individual receipts. OCR adds complexity with no value for BPR parameter tracking | Structured monthly data entry forms |
| Mobile-first native app | Mobile looks modern | Users work at desks with Excel; the PC browser context is correct. Responsive-as-bonus is sufficient — optimizing for mobile first misallocates effort | Responsive layout that works on desktop primary, mobile secondary |
| Drill-down to individual transaction detail | BI dashboards commonly offer this | The BPR evaluation is at aggregate month level; transaction-level data is maintained in other Askrindo systems. Adding this creates data entry burden with no evaluation value | Monthly aggregate input rows (match the Cirebon Excel structure) |
| Customizable dashboard layout | Users expect to personalize | Non-technical users get confused by moveable widgets and layout editors. The layout should be opinionated and fixed based on the BPR evaluation flow | Single well-designed layout; no customization |
| Unlimited historical years | Long history feels complete | localStorage at ~5MB per origin will overflow with multiple years across multiple branches. Risk of silent data loss | Keep current year + prior year (needed for YoY); archive older years to JSON export |
| Collaborative editing / multi-user simultaneous edit | Teams want to work together | Without a server and WebSockets, real-time collaboration is impossible. Faking it would create data conflicts | Designate one data entry owner per branch; others view via exported reports |

---

## Feature Dependencies

```
[Branch Profile + RKAP Input]
    └──requires──> [Monthly Data Input Form]
                       └──requires──> [BPR Calculator Core (Nominal + Rasio + YoY)]
                                          └──requires──> [RAG Status Indicators]
                                          └──requires──> [Summary KPI Cards]
                                          └──requires──> [YTD Cumulative Totals]

[BPR Calculator Core]
    └──enables──> [Mid-Month Projection]
                      └──enables──> [Projective Early Warning]
                      └──enables──> [What-If Simulation]

[BPR Calculator Core]
    └──enables──> [Trend Charts]

[Monthly Data Input Form]
    └──enables──> [RKAP Pre/Post Revision Support]

[All data in localStorage]
    └──enables──> [JSON Export]
    └──enables──> [XLSX Export]
    └──enables──> [Multi-Branch Profile Management]

[XLSX Export] ──enhances──> [Print / Printable Report]

[What-If Simulation] ──conflicts──> [Projective Early Warning display]
    (simulation mode must be visually distinct from actual projection to prevent confusion)
```

### Dependency Notes

- **BPR Calculator Core requires Monthly Data Input:** Calculations have no inputs without the form. This means the data entry form ships in Phase 1 alongside the calculator, not as a later enhancement.
- **Mid-Month Projection requires BPR Calculator Core:** Projection is a specialized view of the core calculation using partial-month inputs. It cannot be built before the base calculation logic is correct.
- **What-If Simulation conflicts with Projective Early Warning in same view:** If both show simultaneously, users cannot distinguish between "what will happen" (actual projection) vs. "what if I do X" (simulation). Simulation mode must use a clearly differentiated visual state — different background color, labeled banner, or separate panel.
- **RKAP Revision Support requires Monthly Data Input:** Revision only has meaning once a base RKAP is entered. Ship base RKAP first; revision support can be a v1.x addition.
- **Multi-Branch Profile Management requires JSON Export:** Switching profiles is safe only if users can export current branch data first. Implement export before enabling profile switching.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to replace the Cirebon Excel and validate the concept.

- [ ] Branch profile input (nama cabang, tahun, RKAP per segment) — without this, nothing has context
- [ ] Monthly data entry form (beban realisasi + premi realisasi per month, per segment) — the core input
- [ ] BPR calculator: Nominal (YTD actual vs. YTD target) — the first parameter
- [ ] BPR calculator: Rasio (beban / premi per month and YTD) — the second parameter
- [ ] BPR calculator: YoY growth (vs. prior year data entry) — the third parameter; requires prior-year data input too
- [ ] Segment breakdown: Non KUR, KUR, Gabungan (auto-sum) — Askrindo evaluates by segment
- [ ] RAG status indicators for all three parameters — core monitoring signal
- [ ] Summary KPI cards on dashboard — scannable top-of-page status
- [ ] Trend charts for Beban, Rasio, YoY over months — visual context
- [ ] localStorage persistence — app is useless without this
- [ ] Indonesian UI + number formatting — non-negotiable for target users
- [ ] JSON export/import — offline data backup and safety net

### Add After Validation (v1.x)

Features to add once core calculation is confirmed correct by at least one Pinca.

- [ ] Mid-month projection (1-15 input + 16-31 estimate) — high-value once base is correct; add when users confirm base calculation logic matches their Excel
- [ ] Projective early warning ("akan melebihi target bulan X") — builds on projection; add after projection is validated
- [ ] What-If simulation (Bagaimana Jika) — add after projection is stable; keeps simulation clearly separate from actuals
- [ ] XLSX export — add after JSON export is working; depends on SheetJS integration matching Cirebon sheet structure
- [ ] Print/PDF report — add when users request it for LPJD meetings
- [ ] Pre/post-revision RKAP support — add when a user actually encounters a mid-year revision; over-engineering before that point

### Future Consideration (v2+)

Features to defer until product has multiple branch users.

- [ ] Multi-branch profile management — useful once more than one branch uses the app; adds complexity to data model before need is confirmed
- [ ] Service Worker / offline caching — useful for low-connectivity branches; only needed once non-Cirebon branches adopt the tool

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| BPR Calculator (3 parameters) | HIGH | MEDIUM | P1 |
| Monthly data entry form | HIGH | LOW | P1 |
| RAG status indicators | HIGH | LOW | P1 |
| Summary KPI cards | HIGH | LOW | P1 |
| Segment breakdown (Non KUR / KUR / Gabungan) | HIGH | LOW | P1 |
| localStorage persistence | HIGH | LOW | P1 |
| Indonesian UI + number formatting | HIGH | LOW | P1 |
| JSON export/import | HIGH | LOW | P1 |
| Trend charts | MEDIUM | MEDIUM | P1 |
| Mid-month projection | HIGH | MEDIUM | P2 |
| Projective early warning | HIGH | MEDIUM | P2 |
| What-If simulation | HIGH | MEDIUM | P2 |
| XLSX export | MEDIUM | MEDIUM | P2 |
| Print report | MEDIUM | LOW | P2 |
| RKAP pre/post revision | MEDIUM | MEDIUM | P2 |
| Multi-branch profiles | LOW | LOW | P3 |
| Service Worker / offline cache | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (v1)
- P2: Should have, add after validation (v1.x)
- P3: Nice to have, future consideration (v2+)

---

## Competitor Feature Analysis

This app has no direct competitors — no tool specifically monitors Askrindo BPR parameters. The closest
comparisons are generic financial dashboards and the Cirebon Excel.

| Feature | Cirebon Excel (status quo) | Generic Financial Dashboard (e.g., Power BI) | Our Approach |
|---------|---------------------------|----------------------------------------------|--------------|
| BPR 3-parameter calculation | Manual formula, error-prone | Not applicable — no Askrindo domain knowledge | Hardcoded formula per parameter; no user formula editing |
| RAG status | Manual cell coloring | Configurable RAG with thresholds | Pre-configured thresholds per Askrindo rules; user cannot break it |
| Mid-month projection | Manual copy-paste pattern | Not available | Structured first-half input + second-half estimate fields |
| What-If simulation | None | Available in premium tools (Cube, Synario) | Simple real-time recalculation; no server, no AI |
| Multi-segment (Non KUR / KUR) | Separate sheets | Requires custom setup | Tabs/sections with auto-sum for Gabungan |
| Data persistence | File save (fragile) | Cloud database | localStorage + JSON export (portable, no account required) |
| Offline operation | Always offline (local file) | Requires internet (SaaS) | PWA or static HTML + localStorage; works offline |
| Export to Excel | It IS the Excel | Available but generic format | XLSX export matching Cirebon sheet structure exactly |
| Language | Indonesian (user-managed) | English default, localization varies | Indonesian-first; no English labels anywhere |
| Non-technical UX | Excel UX (familiar but risky) | Complex, enterprise-oriented | Simplified; one clear flow; labeled in plain Indonesian |

---

## Sources

- [Best finance dashboard templates in 2026 - Sheetgo](https://www.sheetgo.com/blog/finance-templates/best-finance-dashboard-templates/) — MEDIUM confidence
- [Financial Dashboard Examples - 2026 Comprehensive Guide - SelectHub](https://www.selecthub.com/embedded-analytics/financial-dashboard/) — MEDIUM confidence
- [RAG Status: A Simple Guide to Effective KPI Management - ClearPoint Strategy](https://www.clearpointstrategy.com/blog/establish-rag-statuses-for-kpis) — MEDIUM confidence
- [How to Start With Budget App Design: 8 Tips From Fintech UI/UX Experts - Eleken](https://www.eleken.co/blog-posts/budget-app-design) — MEDIUM confidence
- [28 Best Insurance KPIs and Metrics Examples for 2025 - Insightsoftware](https://insightsoftware.com/blog/best-insurance-kpis-and-metrics/) — MEDIUM confidence
- [What-If Analysis: Methods & Examples - Abacum](https://www.abacum.ai/blog/what-if-analysis) — MEDIUM confidence
- [Storage quotas and eviction criteria - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — HIGH confidence
- [YTD and Projected Profit & Loss Layouts - Spotlight Reporting](https://help.spotlightreporting.com/help-articles/ytd-and-projected-profit-loss-layouts) — MEDIUM confidence
- [Feature Creep in Software Development - Avoid Common Pitfalls - QAT Global](https://qat.com/feature-creep-in-software-development/) — MEDIUM confidence
- [10 Must-Have Features of Expense Tracking App - RipenApps](https://ripenapps.com/blog/expense-tracking-app-features/) — LOW confidence (general, not insurance-specific)
- [Offline-First App Development Guide for Frontend & SaaS Teams - Medium](https://medium.com/@hashbyt/offline-first-app-development-guide-cfa7e9c36a52) — LOW confidence (pattern guidance only)

---

*Feature research for: insurance branch marketing expense BPR monitoring dashboard*
*Researched: 2026-02-23*
