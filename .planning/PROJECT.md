# Monitor Beban Pemasaran Cabang Asuransi

## What This Is

Aplikasi web berbahasa Indonesia untuk memantau beban pemasaran cabang PT Asuransi Kredit Indonesia (Askrindo). Mereplikasi dan meningkatkan spreadsheet Excel manual yang digunakan oleh satu cabang (Cirebon) menjadi alat standar yang bisa dipakai oleh semua Pinca dan staf pemasaran di seluruh Indonesia. Menghitung tiga parameter evaluasi BPR (Business Performance Review) secara otomatis: nominal anggaran, rasio beban terhadap premi, dan pertumbuhan year-on-year.

## Core Value

Pinca bisa melihat posisi beban pemasaran cabangnya terhadap ketiga parameter BPR kapan saja, sehingga tidak pernah lagi terkejut saat evaluasi LPJD.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Kalkulator tiga parameter BPR (Nominal, Rasio, YoY) per segmen (Non KUR, KUR, Gabungan)
- [ ] Input profil cabang, RKAP, target bulanan, realisasi beban/premi
- [ ] Proyeksi paruh bulan (realisasi tgl 1-15 + estimasi tgl 16-31)
- [ ] Dasbor dengan kartu ringkasan dan kode warna (hijau/kuning/merah)
- [ ] Tabel Nominal, Rasio, dan YoY mereplikasi sheet Excel Cirebon
- [ ] Grafik tren beban, rasio, YoY, dan kumulatif YTD
- [ ] Simulasi "Bagaimana Jika" dengan perhitungan real-time
- [ ] Peringatan dini saat mendekati/melebihi batas parameter
- [ ] Ekspor/impor data (JSON dan XLSX)
- [ ] Penyimpanan lokal via localStorage + file manual
- [ ] Seluruh UI dalam Bahasa Indonesia dengan format angka Indonesia
- [ ] Berfungsi offline setelah dimuat pertama kali
- [ ] Notifikasi proyektif ("akan melebihi target pada bulan X")
- [ ] Dukungan multi-cabang (simpan beberapa profil)
- [ ] Dukungan versi RKAP sebelum/sesudah revisi
- [ ] Cetak/ekspor laporan ringkasan

### Out of Scope

- Backend/server — aplikasi sepenuhnya client-side, tanpa database server
- Autentikasi/login — tidak ada akun pengguna, data disimpan lokal
- Real-time sync antar cabang — setiap cabang independen
- Mobile native app — web-first, responsif sebagai bonus
- Integrasi dengan sistem internal Askrindo — standalone tool

## Context

- **Asal masalah:** Tidak ada alat monitoring standar dari kantor pusat Askrindo. Satu-satunya alat adalah Excel buatan Pinca Cirebon yang sulit direplikasi.
- **Dampak nyata:** Pinca bisa ditegur langsung oleh LPJD saat BPR karena tidak memantau beban. Bisa berujung penilaian "tidak mampu mengelola cabang."
- **Pengguna:** Pinca dan staf pemasaran di seluruh cabang Indonesia — tidak memiliki latar belakang IT, terbiasa Excel.
- **Konteks bisnis:** Beban pemasaran bersifat "investasi" dengan delayed reward — biaya di bulan ini bisa menghasilkan premi di bulan-bulan berikutnya.
- **3 Parameter BPR:**
  1. **Nominal** — Realisasi beban YTD vs target YTD (tidak boleh melebihi jatah)
  2. **Rasio** — Beban pemasaran / Premi (semakin kecil semakin baik)
  3. **YoY** — Pertumbuhan beban dibanding tahun lalu (harus datar/menurun)
- **Segmentasi:** Non KUR, KUR, dan Gabungan (otomatis = Non KUR + KUR)
- **Data contoh:** Tersedia lengkap dari Cabang Cirebon evaluasi Oktober 2024
- **Pembuat:** Mantan Pinca yang memahami kebutuhan langsung dari pengalaman di lapangan

## Constraints

- **Tech stack:** React + Tailwind CSS + Recharts/Chart.js + SheetJS (xlsx) — sudah diputuskan
- **Bahasa:** Seluruh UI wajib Bahasa Indonesia, tanpa teks Inggris
- **Format angka:** Standar Indonesia (titik pemisah ribuan, koma desimal)
- **Offline:** Harus berfungsi tanpa internet setelah dimuat
- **No backend:** Semua penyimpanan client-side (localStorage + file ekspor/impor)
- **Deployment:** Harus bisa diakses sebagai website statis DAN bisa disimpan/dibuka lokal
- **Pengguna non-IT:** Antarmuka harus sangat sederhana, mirip pengalaman Excel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React SPA + Tailwind | Sesuai rekomendasi PRD, stack modern dan ringan | — Pending |
| Client-side only (no backend) | Pinca tersebar di seluruh Indonesia, internet tidak selalu stabil | — Pending |
| Ekspor/impor file sebagai persistence | Tanpa server, data harus portable dan bisa di-backup manual | — Pending |
| Build all 5 phases | Aplikasi lengkap: calculator, dashboard, simulation, data mgmt, advanced | — Pending |
| Dual deployment (web + local) | Website yang bisa diakses online dan juga disimpan untuk offline | — Pending |

---
*Last updated: 2026-02-23 after initialization*
