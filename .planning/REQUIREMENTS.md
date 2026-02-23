# Requirements: Monitor Beban Pemasaran

**Defined:** 2026-02-23
**Core Value:** Pinca bisa melihat posisi beban pemasaran cabangnya terhadap ketiga parameter BPR kapan saja, sehingga tidak pernah lagi terkejut saat evaluasi LPJD.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input Data

- [ ] **INPT-01**: User can create branch profile with name, region (Kanwil), and current/previous year
- [ ] **INPT-02**: User can enter annual RKAP budget per segment (Non KUR, KUR); Gabungan calculated automatically
- [ ] **INPT-03**: User can enter monthly YTD expense targets per segment (Jan-Dec)
- [ ] **INPT-04**: User can enter monthly YTD premium targets per segment (Jan-Dec)
- [ ] **INPT-05**: User can enter monthly actual expense realization per segment
- [ ] **INPT-06**: User can enter monthly actual premium realization per segment
- [ ] **INPT-07**: User can enter previous year monthly expense data per segment (for YoY)

### Kalkulasi BPR

- [ ] **KALK-01**: System calculates Pencapaian Nominal (Realisasi Beban YTD / Target Beban YTD) per segment
- [ ] **KALK-02**: System calculates Pencapaian RKAP (Realisasi Beban YTD / RKAP Tahunan) per segment
- [ ] **KALK-03**: System calculates Rasio Beban Pemasaran (Beban / Premi) per segment
- [ ] **KALK-04**: System calculates Pencapaian Rasio (Rasio Realisasi / Rasio Target) per segment
- [ ] **KALK-05**: System calculates Pertumbuhan YoY ((Real YTD tahun ini - Real YTD tahun lalu) / Real YTD tahun lalu) per segment
- [ ] **KALK-06**: System calculates Sisa Anggaran (Target YTD - Realisasi YTD) per segment
- [ ] **KALK-07**: Gabungan (Non KUR + KUR) calculated automatically for all parameters
- [ ] **KALK-08**: System applies RAG color coding: hijau (< 80%), kuning (80-99%), merah (>= 100%)
- [ ] **KALK-09**: System handles division by zero and missing data gracefully (displays "—" not error)
- [ ] **KALK-10**: All monetary values stored as integers (juta Rupiah) to prevent floating-point drift

### Dasbor

- [ ] **DASH-01**: User sees 3 summary cards at top showing current status per BPR parameter with RAG colors
- [ ] **DASH-02**: User sees Tabel Nominal replicating Excel sheet "Nominal" (baris: Gabungan, Non KUR, KUR)
- [ ] **DASH-03**: User sees Tabel Rasio per bulan replicating Excel sheet "Rasio" (3 blok: Non KUR, KUR, Gabungan)
- [ ] **DASH-04**: User sees Tabel YoY replicating Excel sheet "YOY" (realisasi tahun lalu vs tahun ini per bulan)

### Grafik

- [ ] **GRAF-01**: User sees bar chart of monthly expense realization vs target
- [ ] **GRAF-02**: User sees line chart of expense ratio trend per segment
- [ ] **GRAF-03**: User sees side-by-side bar chart comparing YoY per month
- [ ] **GRAF-04**: User sees area chart of cumulative YTD expense vs target

### Simulasi & Peringatan

- [ ] **SIML-01**: User can input hypothetical expense/premium values and see all 3 BPR parameters recalculated in real-time
- [ ] **SIML-02**: User sees "Berapa premi yang dibutuhkan agar rasio aman?" calculation
- [ ] **SIML-03**: System shows warning when any parameter reaches 80-99% (kuning)
- [ ] **SIML-04**: System shows alert when any parameter exceeds 100% (merah)
- [ ] **SIML-05**: System projects "Dengan laju saat ini, akan melebihi target pada bulan [X]"

### Manajemen Data

- [ ] **DATA-01**: System auto-saves all data to localStorage on every change
- [ ] **DATA-02**: User can export all branch data to JSON file
- [ ] **DATA-03**: User can export all branch data to XLSX file
- [ ] **DATA-04**: User can import data from previously exported JSON file
- [ ] **DATA-05**: User can import data from XLSX file
- [ ] **DATA-06**: System validates imported files and shows clear Indonesian error messages for invalid files
- [ ] **DATA-07**: System shows save reminder when user closes page with unsaved changes
- [ ] **DATA-08**: Export filename follows pattern: beban_pemasaran_[nama_cabang]_[tahun]_[tanggal].json/xlsx

### Fitur Lanjutan

- [ ] **LNJT-01**: User can store RKAP versions (before/after revision) and switch between them
- [ ] **LNJT-02**: User can save and switch between multiple branch profiles
- [ ] **LNJT-03**: User can print/export summary report

### Proyeksi Paruh Bulan

- [ ] **PROY-01**: User can input realisasi tgl 1-15 and estimasi tgl 16-31 for mid-month projection
- [ ] **PROY-02**: System calculates Asumsi Total YTD (Real YTD bulan lalu + Real paruh 1 + Potensi paruh 2)
- [ ] **PROY-03**: System calculates projected % YTD and projected sisa anggaran based on mid-month data

### Bahasa & Teknis

- [ ] **TECH-01**: Entire UI displayed in Bahasa Indonesia (no English text)
- [ ] **TECH-02**: Numbers formatted Indonesian style (titik ribuan, koma desimal: Rp1.234.567,89)
- [ ] **TECH-03**: App works offline after initial load (Service Worker / PWA)
- [ ] **TECH-04**: App deployable as static website AND usable when saved locally

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/server database | App sepenuhnya client-side untuk akses offline dan tanpa infrastruktur |
| Autentikasi/login | Tidak ada akun pengguna, data disimpan lokal per browser |
| Real-time sync antar cabang | Setiap cabang independen, tidak perlu sinkronisasi |
| Mobile native app | Web-first, responsif sebagai bonus saja |
| Integrasi sistem internal Askrindo | Standalone tool, tidak tergantung sistem lain |
| Real-time chat/kolaborasi | Complexity tinggi, bukan kebutuhan inti monitoring |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPT-01 | Phase 1 | Pending |
| INPT-02 | Phase 1 | Pending |
| INPT-03 | Phase 1 | Pending |
| INPT-04 | Phase 1 | Pending |
| INPT-05 | Phase 1 | Pending |
| INPT-06 | Phase 1 | Pending |
| INPT-07 | Phase 1 | Pending |
| KALK-01 | Phase 1 | Pending |
| KALK-02 | Phase 1 | Pending |
| KALK-03 | Phase 1 | Pending |
| KALK-04 | Phase 1 | Pending |
| KALK-05 | Phase 1 | Pending |
| KALK-06 | Phase 1 | Pending |
| KALK-07 | Phase 1 | Pending |
| KALK-08 | Phase 1 | Pending |
| KALK-09 | Phase 1 | Pending |
| KALK-10 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-02 | Phase 1 | Pending |
| TECH-03 | Phase 1 | Pending |
| TECH-04 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| GRAF-01 | Phase 2 | Pending |
| GRAF-02 | Phase 2 | Pending |
| GRAF-03 | Phase 2 | Pending |
| GRAF-04 | Phase 2 | Pending |
| SIML-01 | Phase 3 | Pending |
| SIML-02 | Phase 3 | Pending |
| SIML-03 | Phase 3 | Pending |
| SIML-04 | Phase 3 | Pending |
| SIML-05 | Phase 3 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |
| DATA-04 | Phase 4 | Pending |
| DATA-05 | Phase 4 | Pending |
| DATA-06 | Phase 4 | Pending |
| DATA-07 | Phase 4 | Pending |
| DATA-08 | Phase 4 | Pending |
| LNJT-01 | Phase 4 | Pending |
| LNJT-02 | Phase 4 | Pending |
| LNJT-03 | Phase 4 | Pending |
| PROY-01 | Phase 1 | Pending |
| PROY-02 | Phase 1 | Pending |
| PROY-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 — moved PROY-01/02/03 from deferred to v1 Phase 1 (already implemented in code)*
