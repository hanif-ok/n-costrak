# Roadmap: Monitor Beban Pemasaran Cabang Asuransi

## Overview

Aplikasi web client-side untuk memantau tiga parameter BPR Askrindo. Dibangun dalam empat fase: fondasi kalkulator dengan engine yang terverifikasi terlebih dahulu, dilanjutkan dengan dasbor visual, lalu simulasi dan peringatan dini, dan terakhir manajemen data lengkap beserta fitur lanjutan. Pendekatan ini memastikan formula BPR sudah benar sebelum tampilan dibangun, dan data aman sebelum fitur multi-cabang ditambahkan.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Fondasi Kalkulator** - Engine BPR, form input data, localStorage, dan scaffold teknis
- [ ] **Phase 2: Dasbor dan Visualisasi** - Kartu KPI, tabel replikasi Excel Cirebon, dan grafik tren
- [ ] **Phase 3: Simulasi dan Peringatan** - Simulasi "Bagaimana Jika" dan sistem peringatan dini
- [ ] **Phase 4: Manajemen Data dan Fitur Lanjutan** - Ekspor/impor, multi-cabang, revisi RKAP, cetak

## Phase Details

### Phase 1: Fondasi Kalkulator
**Goal**: Pinca dapat memasukkan data bulanan dan melihat ketiga parameter BPR (Nominal, Rasio, YoY) terhitung otomatis dan tersimpan dengan benar
**Depends on**: Nothing (first phase)
**Requirements**: INPT-01, INPT-02, INPT-03, INPT-04, INPT-05, INPT-06, INPT-07, KALK-01, KALK-02, KALK-03, KALK-04, KALK-05, KALK-06, KALK-07, KALK-08, KALK-09, KALK-10, PROY-01, PROY-02, PROY-03, DATA-01, TECH-01, TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. Pinca dapat membuat profil cabang, memasukkan RKAP, target bulanan, dan realisasi beban/premi per segmen (Non KUR, KUR), lalu nilai Gabungan terhitung otomatis
  2. Ketiga parameter BPR (Nominal, Rasio, YoY) tampil dengan kode warna RAG yang benar (hijau/kuning/merah) sesuai threshold Askrindo
  3. Semua angka tampil dalam format Indonesia (titik ribuan, koma desimal) dan seluruh teks UI berbahasa Indonesia
  4. Data tersimpan otomatis ke localStorage dan tetap ada setelah browser ditutup dan dibuka kembali
  5. Aplikasi berfungsi penuh tanpa koneksi internet setelah pemuatan pertama
**Plans**: TBD

Plans:
- [ ] 01-01: Scaffold proyek React + TypeScript + Vite + Tailwind, konfigurasi PWA dan deployment statis
- [ ] 01-02: Calculation engine (pure TypeScript) untuk semua formula BPR + unit tests threshold boundary
- [ ] 01-03: Form input profil cabang, RKAP, target, dan realisasi bulanan; Zustand stores + localStorage persistence

### Phase 2: Dasbor dan Visualisasi
**Goal**: Pinca dapat melihat status BPR cabangnya secara visual sekilas melalui kartu ringkasan, tabel yang familiar seperti Excel, dan grafik tren bulanan
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, GRAF-01, GRAF-02, GRAF-03, GRAF-04
**Success Criteria** (what must be TRUE):
  1. Pinca melihat 3 kartu ringkasan di bagian atas dengan status RAG terkini untuk masing-masing parameter BPR
  2. Pinca melihat Tabel Nominal, Tabel Rasio, dan Tabel YoY yang strukturnya sama dengan sheet Excel Cirebon
  3. Pinca melihat grafik batang realisasi vs target, grafik garis tren rasio, grafik YoY, dan grafik area YTD kumulatif
**Plans**: TBD

Plans:
- [ ] 02-01: Kartu KPI ringkasan dengan RAG dan tabel Nominal/Rasio/YoY (replikasi Excel Cirebon)
- [ ] 02-02: Grafik tren (bar, line, area) menggunakan Recharts dengan format angka Indonesia

### Phase 3: Simulasi dan Peringatan
**Goal**: Pinca dapat mensimulasikan skenario "bagaimana jika" dan menerima peringatan sebelum batas parameter BPR terlampaui
**Depends on**: Phase 2
**Requirements**: SIML-01, SIML-02, SIML-03, SIML-04, SIML-05
**Success Criteria** (what must be TRUE):
  1. Pinca dapat memasukkan nilai hipotetis dan melihat ketiga parameter BPR terhitung ulang secara real-time tanpa mengubah data asli
  2. Sistem menampilkan peringatan kuning otomatis saat parameter mendekati 80-99%, dan alert merah saat parameter melebihi 100%
  3. Sistem menampilkan proyeksi "dengan laju saat ini, akan melebihi target pada bulan [X]" berdasarkan tren realisasi
**Plans**: TBD

Plans:
- [ ] 03-01: Panel simulasi "Bagaimana Jika" dengan simulasiStore terpisah (tidak persisted) dan banner MODE SIMULASI
- [ ] 03-02: Sistem peringatan dini RAG otomatis dan proyeksi bulanan

### Phase 4: Manajemen Data dan Fitur Lanjutan
**Goal**: Pinca dapat mengekspor/mengimpor data dengan aman, menyimpan beberapa profil cabang, mengelola revisi RKAP, dan mencetak laporan ringkasan
**Depends on**: Phase 3
**Requirements**: DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, LNJT-01, LNJT-02, LNJT-03
**Success Criteria** (what must be TRUE):
  1. Pinca dapat mengekspor data ke file JSON dan XLSX, lalu mengimpornya kembali dengan validasi dan pesan error dalam Bahasa Indonesia
  2. Browser menampilkan pengingat simpan saat Pinca akan menutup halaman dengan perubahan yang belum diekspor; nama file ekspor mengikuti pola baku
  3. Pinca dapat menyimpan dan beralih antar profil cabang, serta menyimpan versi RKAP sebelum dan sesudah revisi
  4. Pinca dapat mencetak atau mengekspor laporan ringkasan untuk dibawa ke rapat LPJD
**Plans**: TBD

Plans:
- [ ] 04-01: Ekspor/impor JSON dan XLSX (SheetJS 0.20.3 dari CDN tarball) dengan validasi dan pesan error Indonesia
- [ ] 04-02: Pengingat simpan, multi-profil cabang, manajemen revisi RKAP, dan cetak laporan

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fondasi Kalkulator | 0/3 | Not started | - |
| 2. Dasbor dan Visualisasi | 0/2 | Not started | - |
| 3. Simulasi dan Peringatan | 0/2 | Not started | - |
| 4. Manajemen Data dan Fitur Lanjutan | 0/2 | Not started | - |
