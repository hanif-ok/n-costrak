# Phase 1: Fondasi Kalkulator - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Pinca memasukkan data keuangan cabang (profil cabang, RKAP tahunan, target bulanan, realisasi bulanan, data tahun lalu) dan melihat 3 parameter BPR (Nominal, Rasio, YoY) terhitung otomatis dengan kode warna RAG. Semua data tersimpan ke localStorage. UI berbahasa Indonesia dengan format angka Indonesia. App berfungsi offline sebagai PWA.

Dasbor visual, grafik, simulasi, dan ekspor/impor adalah fase terpisah.

</domain>

<decisions>
## Implementation Decisions

### Form structure & flow
- Step-by-step wizard: Profil Cabang → RKAP → Target Bulanan → Realisasi Bulanan → Data Tahun Lalu
- Stepper indicator shows progress through steps
- Final summary/review step before confirming — user can go back to fix anything
- Auto-save per step to localStorage (data not lost if browser closes mid-wizard)

### Data entry grids
- Spreadsheet-style grid for monthly data: rows for segments (Non KUR, KUR), columns for months (Jan-Dec)
- All 12 months always visible, empty cells show as dash
- Tab-key navigation between cells for fast data entry
- Gabungan row hidden by default, toggle to show (keeps grid compact)
- Real-time validation on blur: immediate Indonesian error messages ("Nilai harus positif", etc.)

### Calculation result display
- Separate results page after wizard completion (clean separation input vs output)
- 3 summary cards at top for quick BPR status (Nominal, Rasio, YoY) with RAG indicators
- Detailed breakdown table below cards showing per-segment values
- Sisa Anggaran (remaining budget) displayed prominently as its own section — key metric for Pinca

### Overall app layout
- Corporate/professional visual tone: clean, muted colors (blues, grays), trustworthy feel for insurance internal tool
- Askrindo blue as primary brand color
- Fully responsive: adapted layouts for mobile, tablet, and desktop
- Spreadsheet grids may scroll horizontally on mobile

### Claude's Discretion
- Navigation pattern (sidebar vs top nav) — choose what scales best for later phases
- Wizard navigation behavior (free nav vs sequential with back) — pick what's best for data entry
- RAG indicator visual style (badges, borders, backgrounds) — pick the clearest treatment
- Numeric input formatting approach (plain numbers vs formatted-as-you-type)
- Loading states and transitions between wizard steps
- Exact spacing, typography, and card styling

</decisions>

<specifics>
## Specific Ideas

- Askrindo blue as brand identity — match the organization's corporate color
- Spreadsheet-style grids should feel familiar to Pinca who currently use Excel for BPR monitoring
- Summary review step at end of wizard is important — Pinca wants to verify data before it's used for calculations
- Sisa Anggaran is a key metric that deserves prominent placement, not buried in a table

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-fondasi-kalkulator*
*Context gathered: 2026-02-23*
