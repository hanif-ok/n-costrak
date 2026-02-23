# Prompt Pengembangan Aplikasi: Monitor Beban Pemasaran Cabang Asuransi

---

## 1. Latar Belakang

PT Asuransi Kredit Indonesia (Askrindo) memiliki cabang-cabang yang tersebar di seluruh Indonesia. Setiap bulan, cabang dievaluasi melalui **Business Performance Review (BPR)** oleh LPJD (pimpinan wilayah). Salah satu sorotan utama adalah **beban pemasaran** — biaya yang dikeluarkan cabang untuk mendapatkan premi dari mitra perbankan dan nasabah.

Contoh beban pemasaran di lapangan: jamuan makan/kopi dengan mitra bank, kunjungan relasi, hadiah/oleh-oleh ke rekanan, kegiatan entertainment bersama calon nasabah, dan biaya perjalanan Relationship Manager (RM). Biaya ini bersifat "investasi" — mengeluarkan uang di depan untuk menghasilkan premi di kemudian hari (delayed reward).

### Permasalahan Saat Ini
- **Tidak ada alat monitoring standar** dari kantor pusat. Cabang harus bikin sendiri atau tidak memantau sama sekali.
- Satu-satunya Pinca yang membuat alat sendiri menggunakan **Excel manual** (Cabang Cirebon) — hasilnya fungsional tapi sulit direplikasi ke cabang lain.
- Banyak Pinca dan staf pemasaran **tidak memahami cara menghitung** parameter evaluasi, sehingga baru tahu sudah melanggar saat dievaluasi.
- Dampak pelanggaran: **teguran langsung** dari LPJD saat BPR, bahkan bisa berujung pada penilaian "Pinca tidak mampu mengelola cabang."

### Tujuan Aplikasi
Membangun **aplikasi web sederhana berbahasa Indonesia** yang dapat digunakan oleh Pinca dan staf pemasaran (tanpa latar belakang IT) di seluruh cabang Indonesia untuk:
1. Memantau posisi beban pemasaran terhadap target secara real-time
2. Memproyeksikan posisi akhir bulan sebelum terlambat
3. Menghitung rasio efisiensi beban terhadap premi
4. Membandingkan pertumbuhan beban year-on-year
5. Memberikan peringatan dini sebelum melampaui batas

---

## 2. Tiga Parameter Penilaian BPR

Inilah tiga parameter yang digunakan LPJD untuk menilai kesehatan cabang dalam mengelola beban pemasaran:

### Parameter 1: Nilai Nominal Beban Pemasaran

**Konsep:** Cabang diberikan jatah beban pemasaran tahunan (disebut RKAP). Jatah ini dipecah per bulan secara kumulatif YTD (Year-to-Date). Realisasi belanja **tidak boleh melebihi** jatah tersebut.

**Analogi dari transkrip:** "Gua kasih jatah peluru 100. Berarti lu enggak boleh ngelewatin 100 peluru ini."

| Istilah | Penjelasan |
|---|---|
| RKAP | Rencana Kerja Anggaran Perusahaan — total anggaran beban setahun |
| Target YTD | Jatah kumulatif sampai bulan tertentu |
| Realisasi YTD | Total pengeluaran aktual kumulatif sampai bulan tertentu |
| Sisa Anggaran | `Target YTD - Realisasi YTD` |

**Rumus:**
```
Pencapaian Nominal (%) = (Realisasi Beban YTD / Target Beban YTD) × 100%
Pencapaian RKAP (%)    = (Realisasi Beban YTD / RKAP Tahunan) × 100%
Sisa Anggaran           = Target YTD Bulan Berjalan - Asumsi Realisasi YTD
```

**Penilaian:**
- 🟢 **Sehat:** < 100% (belanja di bawah jatah)
- 🔴 **Tidak sehat:** ≥ 100% (melebihi jatah → teguran)

**Fitur proyeksi (dari Excel sheet "Nominal"):**
Pinca bisa memasukkan data paruh bulan untuk proyeksi akhir bulan:
```
Asumsi Total YTD = Real YTD bulan lalu (A) + Real tgl 1-15 (B) + Potensi tgl 16-30/31 (C)
```

---

### Parameter 2: Rasio Beban Pemasaran

**Konsep:** Mengukur efisiensi — berapa besar biaya yang dikeluarkan dibandingkan premi yang dihasilkan.

**Analogi dari transkrip:** "Mancing ikan — beli umpannya Rp200, dapatnya cuma ikan senilai Rp100. Berarti rasionya 200% — semakin tinggi semakin buruk."

**Rumus:**
```
Rasio Beban Pemasaran    = (Beban Pemasaran / Premi) × 100%
Pencapaian Rasio (%)     = (Rasio Realisasi / Rasio Target) × 100%
```

**Penilaian:**
- 🟢 **Sangat sehat:** Rasio jauh di bawah 100% (contoh: 14% = keluar Rp100, dapat premi Rp700)
- 🟡 **Impas:** 100% (keluar Rp100, dapat premi Rp100 — break even)
- 🔴 **Rugi:** > 100% (contoh: 200% = keluar Rp200, dapat premi Rp100)

Untuk % Pencapaian Rasio:
- 🟢 **Sehat:** < 100% (rasio realisasi lebih kecil dari rasio target = lebih efisien)
- 🔴 **Tidak sehat:** ≥ 100% (rasio realisasi lebih buruk dari target)

**Catatan dari transkrip:** Parameter ini dianggap paling masuk akal ("idealnya tetap yang ini") karena memperhitungkan hubungan antara biaya dan hasil.

---

### Parameter 3: Pertumbuhan Beban Pemasaran (Year-on-Year / YoY)

**Konsep:** Membandingkan beban pemasaran periode berjalan dengan periode yang sama tahun lalu. LPJD menginginkan beban **tidak tumbuh** atau kalau bisa **menurun** dibanding tahun sebelumnya.

**Rumus:**
```
Pertumbuhan YoY (%) = ((Realisasi YTD Tahun Ini - Realisasi YTD Tahun Lalu) / Realisasi YTD Tahun Lalu) × 100%
```

**Penilaian:**
- 🟢 **Sehat:** ≤ 0% (datar atau menurun)
- 🔴 **Tidak sehat:** > 0% (beban tumbuh dibanding tahun lalu)

**Catatan kontroversial dari transkrip:** Parameter ini dianggap kurang adil karena:
- Beban bisa naik karena inflasi (harga kopi naik dari Rp25.000 ke Rp30.000) tanpa ada penambahan kegiatan
- Beban bisa naik wajar jika premi juga naik proporsional (investasi yang menghasilkan)
- Sifat asuransi adalah *delayed reward* — beban di Januari bisa menghasilkan premi di Maret atau Juli

**Namun tetap diberlakukan** sebagai parameter penilaian, sehingga aplikasi tetap harus mendukungnya.

---

## 3. Segmentasi Biaya

Semua parameter dipantau untuk dua segmen bisnis yang kemudian digabungkan:

| Segmen | Keterangan |
|---|---|
| **Non KUR** | Bisnis asuransi non-KUR (komersial, ritel, korporasi) |
| **KUR** | Bisnis asuransi untuk Kredit Usaha Rakyat (program pemerintah) |
| **Gabungan** | Total Non KUR + KUR (**dihitung otomatis, bukan input manual**) |

Selain Biaya Pemasaran (fokus utama), cabang juga memiliki kategori biaya lain:

| Jenis Biaya | Contoh | Termasuk dalam monitoring |
|---|---|---|
| Biaya Umum | Kebutuhan dapur, perbaikan kantor, kerusakan | Opsional |
| Biaya Admin | Kertas HVS, tinta, polis, ATK | Opsional |
| **Biaya Pemasaran** | **Jamuan, kunjungan, entertainment, hadiah mitra** | **Wajib (fokus utama)** |

---

## 4. Spesifikasi Teknis dari Excel Sumber (Cabang Cirebon)

Aplikasi mereplikasi dan meningkatkan **3 sheet Excel** yang sudah digunakan:

### 4.1 Sheet "Nominal" — Anggaran dan Realisasi

**Struktur tabel (per baris: GABUNGAN, NON KUR, KUR):**

| Kolom | Label di Excel | Rumus/Isi | Variabel |
|---|---|---|---|
| 1 | Keterangan | GABUNGAN / NON KUR / KUR | — |
| 2 | Real YTD [Bulan Lalu] | Realisasi beban YTD sampai bulan sebelumnya | A |
| 3 | Target YTD [Bulan Lalu] | Target beban YTD bulan sebelumnya | — |
| 4 | % YTD [Bulan Lalu] | `= A / Target YTD Bulan Lalu` | — |
| 5 | % RKAP | `= A / RKAP Tahunan` | — |
| 6 | Realisasi Tgl 1-15 | Realisasi paruh pertama bulan berjalan | B |
| 7 | Potensi Realisasi Tgl 16-30 | Estimasi paruh kedua bulan berjalan | C |
| 8 | Asumsi Jumlah Realisasi YTD | `= A + B + C` | E |
| 9 | Target YTD [Bulan Berjalan] | Target kumulatif sampai bulan berjalan | F |
| 10 | % YTD [Bulan Berjalan] | `= E / F` | G |
| 11 | RKAP Tahunan | Total anggaran setahun | — |
| 12 | % RKAP | `= E / RKAP` | — |
| 13 | Sisa Anggaran | `= F - E` | — |

**Rumus kunci dari Excel:**
- `=C8/D8` → % YTD bulan lalu
- `=C8/L8` → % RKAP
- `=C8+G8+H8` → Asumsi total (A+B+C)
- `=J9+J10` → Target Gabungan = Non KUR + KUR
- `=I8/J8` → % YTD bulan berjalan
- `=I8/L8` → % RKAP proyeksi
- `=J8-I8` → Sisa anggaran

**Data contoh (Cabang Cirebon, evaluasi Oktober 2024, dalam juta Rp):**

| Keterangan | Real YTD Sep (A) | Target YTD Sep | Real 1-15 Okt (B) | Potensi 16-31 Okt (C) | Asumsi YTD Okt (E) | Target YTD Okt (F) | % YTD Okt | RKAP 2024 | Sisa Anggaran |
|---|---|---|---|---|---|---|---|---|---|
| GABUNGAN | 576 | 837 | 27,6 | 180 | 783,6 | 930,67 | 84,2% | 1.123,91 | 147,07 |
| NON KUR | 412,23 | 334,8 | 27,6 | 16,4 | 456,23 | 372,27 | 122,6% | 449,56 | -83,96 |
| KUR | 163,50 | 502 | 0 | 163,6 | 327,10 | 558,4 | 58,6% | 674,35 | 231,30 |

**Catatan:** NON KUR sudah melebihi target (122,6%) — tanda bahaya. Label "SEBELUM DIREVISI" di Excel mengindikasikan adanya kemungkinan revisi RKAP.

---

### 4.2 Sheet "YOY" — Perbandingan Tahun ke Tahun

**Struktur:**
- Blok tahun 2023: Target YTD per bulan + Realisasi per bulan
- Blok tahun 2024: Target YTD per bulan + Realisasi per bulan
- Blok "ALL REALISASI": Realisasi 2023 vs 2024 berdampingan

**Data contoh (dalam juta Rp — GABUNGAN):**

| Bulan | Target 2023 | Real 2023 | Target 2024 | Real 2024 | Keterangan |
|---|---|---|---|---|---|
| Januari | — | 29,86 | 95,4 | 312,74 | ⚠️ Lonjakan drastis |
| Februari | 180,64 | 48,37 | 185,30 | 12,31 | Terkontrol |
| Maret | 270,97 | 39,56 | 284,11 | 9,38 | Terkontrol |
| April | 361,29 | 20,02 | 378,31 | 10,54 | Terkontrol |
| Mei | 451,61 | 21,53 | 459,16 | 39,12 | |
| Juni | 541,93 | 49,89 | 556,62 | 8,21 | |
| Juli | 632,26 | 41,43 | 658,98 | 77,27 | |
| Agustus | 722,58 | 122,63 | 749,2 | 539,27 | ⚠️ Lonjakan |
| September | 812,9 | 122,13 | 837,01 | 559,27 | |
| Oktober | 903,22 | 214,69 | 930 | — | Belum terisi |
| November | 993,54 | 17,43 | 1.017 | — | Belum terisi |
| Desember | 1.083 | 312,69 | 1.123 | — | Belum terisi |

**Rumus:** Baris "ALL REALISASI" mereferensi langsung ke baris realisasi masing-masing tahun (`=C7`, `=C12`).

---

### 4.3 Sheet "Rasio" — Rasio Beban Pemasaran terhadap Premi

**Struktur per bulan** (berulang Juni–Desember, tiap bulan memiliki 3 blok):

```
[Bulan]
┌─────────────────────────────────────────────────────────────────────┐
│ Non KUR:  Target (Premi, Beban, Rasio) │ Realisasi (Premi, Beban, Rasio) │ % Pencapaian │
│ KUR:      Target (Premi, Beban, Rasio) │ Realisasi (Premi, Beban, Rasio) │ % Pencapaian │
│ Gabungan: Target (Premi, Beban, Rasio) │ Realisasi (Premi, Beban, Rasio) │ % Pencapaian │
└─────────────────────────────────────────────────────────────────────┘
```

**Rumus kunci dari Excel:**
- Rasio Target: `=E6/D6` (Beban Target / Premi Target)
- Rasio Realisasi: `=H6/G6` (Beban Realisasi / Premi Realisasi)
- % Pencapaian: `=I6/F6` (Rasio Realisasi / Rasio Target)
- Gabungan Premi: `=D45+D49` (Non KUR + KUR)
- Gabungan Beban: `=E45+E49` (Non KUR + KUR)

**Data contoh (Juni, Cabang Cirebon, premi dalam juta Rp):**

| Segmen | Premi Target | Beban Target | Rasio Target | Premi Real | Beban Real | Rasio Real | % Pencapaian |
|---|---|---|---|---|---|---|---|
| Non KUR | 7.255 | 223 | 3,07% | 10.352 | 276 | 2,67% | 86,7% 🟢 |
| KUR | 41.872 | 334 | 0,80% | 34.099 | 117 | 0,34% | 43,0% 🟢 |
| Gabungan | 49.127 | 557 | 1,13% | 44.451 | 393 | 0,88% | 78,0% 🟢 |

**Masalah ditemukan di Excel:**
- Rumus tidak konsisten: beberapa bulan `=E/D`, bulan lain `=E/D*100%` → Aplikasi harus menstandarkan
- Bulan Nov-Des realisasi = 0 → menghasilkan error `#DIV/0!` → Aplikasi harus menangani

---

## 5. Kebutuhan Fungsional

### 5.1 Input Data

| No | Fitur Input | Keterangan |
|---|---|---|
| 1 | Profil Cabang | Nama cabang, wilayah/Kanwil, tahun berjalan |
| 2 | RKAP Tahunan | Anggaran total setahun per segmen (Non KUR, KUR). Gabungan dihitung otomatis |
| 3 | Target Bulanan YTD | Target beban pemasaran kumulatif per bulan per segmen |
| 4 | Target Premi YTD | Target premi kumulatif per bulan per segmen (untuk rasio) |
| 5 | Realisasi Beban Tahun Berjalan | Realisasi beban per bulan per segmen |
| 6 | Realisasi Premi Tahun Berjalan | Realisasi premi per bulan per segmen |
| 7 | Realisasi Beban Tahun Sebelumnya | Data beban per bulan tahun lalu per segmen (untuk YoY) |
| 8 | Proyeksi Paruh Bulan | Realisasi tgl 1-15 + Estimasi tgl 16-30/31 bulan berjalan |
| 9 | Satuan | Seluruh angka dalam **juta Rupiah** |

### 5.2 Dasbor & Pemantauan

**A. Kartu Ringkasan (atas halaman)**
Tiga kartu besar menampilkan status terkini per parameter:
- **Kartu Nominal:** "Realisasi YTD: Rp783,6 jt dari target Rp930,67 jt (84,2%)" + warna hijau
- **Kartu Rasio:** "Rasio Gabungan: 0,88% (Pencapaian 78,0%)" + warna hijau
- **Kartu YoY:** "Pertumbuhan: +XX% vs tahun lalu" + warna merah/hijau

Kode warna:
- 🟢 Hijau = sehat (< 80%)
- 🟡 Kuning = waspada (80–99%)
- 🔴 Merah = bahaya (≥ 100%)

**B. Tabel Nominal (mereplikasi sheet "Nominal")**
- Baris: GABUNGAN, NON KUR, KUR
- Kolom lengkap sesuai spesifikasi sheet Nominal di bagian 4.1
- Gabungan otomatis dari penjumlahan Non KUR + KUR
- Kolom Sisa Anggaran dengan warna (positif = hijau, negatif = merah)

**C. Tabel Rasio (mereplikasi sheet "Rasio")**
- Pilihan bulan via dropdown/tab
- Per bulan: 3 blok tabel (Non KUR, KUR, Gabungan)
- Kolom: Target (Premi, Beban, Rasio) | Realisasi (Premi, Beban, Rasio) | % Pencapaian
- % Pencapaian dengan kode warna

**D. Tabel YoY (mereplikasi sheet "YOY")**
- Tabel perbandingan realisasi tahun lalu vs tahun ini per bulan (Januari–Desember)
- Baris target dan realisasi untuk masing-masing tahun
- Kolom pertumbuhan (%) per bulan dengan kode warna

**E. Grafik (fitur baru, tidak ada di Excel)**
- Grafik batang: realisasi beban per bulan vs target
- Grafik garis: tren rasio per bulan (Non KUR, KUR, Gabungan)
- Grafik batang berdampingan: perbandingan YoY per bulan
- Grafik area: beban kumulatif YTD vs target YTD

### 5.3 Simulasi "Bagaimana Jika"

Fitur interaktif untuk membantu Pinca merencanakan ke depan:

| Pertanyaan | Input | Output |
|---|---|---|
| "Jika saya keluarkan Rp X di paruh kedua bulan ini?" | Slider/angka beban | % Pencapaian Nominal + Sisa Anggaran |
| "Berapa premi yang saya butuhkan agar rasio aman?" | Target rasio maksimal | Minimal premi yang diperlukan |
| "Berapa sisa anggaran saya sampai akhir tahun?" | — (otomatis) | RKAP - Asumsi Realisasi YTD |
| "Jika beban bulan ini Rp Z, apakah YoY masih aman?" | Angka beban | Pertumbuhan YoY (%) |

Semua simulasi menghitung ulang ketiga parameter secara real-time.

### 5.4 Peringatan & Notifikasi

- **Peringatan kuning** saat pencapaian parameter manapun mencapai 80–99%
- **Peringatan merah** saat melebihi 100%
- **Peringatan sisa anggaran negatif** (sudah over budget)
- **Proyeksi:** "Dengan laju saat ini, Anda akan melebihi target pada bulan [X]"
- **Penanganan data kosong:** Jika premi = 0 atau data belum terisi, tampilkan "—" bukan error

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Bahasa — Wajib Seluruhnya Bahasa Indonesia

**SELURUH antarmuka WAJIB dalam Bahasa Indonesia.** Tidak boleh ada teks UI dalam bahasa Inggris.

| Konteks | ✅ Benar | ❌ Salah |
|---|---|---|
| Tombol simpan | "Simpan" | "Save" |
| Tambah data | "Tambah Data" | "Add Data" |
| Halaman utama | "Dasbor" | "Dashboard" |
| Metric | "Rasio Beban Pemasaran" | "Marketing Expense Ratio" |
| Data aktual | "Realisasi" | "Actual" |
| Waktu | "Bulan" | "Month" |
| Perbandingan | "Tahun Sebelumnya" | "Prior Year" |
| Fitur | "Simulasi" | "Simulation" |
| Alert | "Peringatan" | "Warning" |
| Metric | "Pencapaian" | "Achievement" |
| Budget | "Sisa Anggaran" | "Remaining Budget" |
| Aksi | "Muat Data" | "Load Data" |
| Aksi | "Ekspor Data" | "Export Data" |

**Format angka standar Indonesia:**
- Mata uang: `Rp1.000.000` (titik pemisah ribuan, koma desimal)
- Angka: `1.234.567,89`
- Persentase: `84,2%`
- Tanggal: `13 Februari 2026` atau `13/02/2026`
- Nama bulan: Januari, Februari, Maret, April, Mei, Juni, Juli, Agustus, September, Oktober, November, Desember

### 6.2 Target Pengguna

- Pemimpin Cabang (Pinca) dan staf pemasaran
- **Tidak memiliki latar belakang IT** — terbiasa dengan Excel, bukan aplikasi web
- Tersebar di seluruh cabang Indonesia (berbagai kualitas internet)

### 6.3 Penyimpanan Data Jangka Panjang

**Metode utama: Ekspor/Impor file manual** (disimpan di komputer pengguna)

| Fitur | Keterangan |
|---|---|
| Tombol "Ekspor Data" | Mengunduh file `.json` atau `.xlsx` berisi seluruh data cabang |
| Tombol "Muat Data" | Mengimpor kembali file yang sudah disimpan sebelumnya |
| Nama file otomatis | `beban_pemasaran_[nama_cabang]_[tahun]_[tanggal].json` |
| Backup sementara | localStorage browser — otomatis simpan setiap ada perubahan |
| Pengingat simpan | Muncul saat pengguna selesai edit dan saat menutup halaman |
| Validasi impor | Tolak file rusak atau format tidak sesuai, tampilkan pesan error jelas |
| Tanpa backend | Tidak memerlukan server, akun, atau koneksi internet untuk menyimpan |

### 6.4 Kebutuhan Teknis Lainnya

| Kebutuhan | Keterangan |
|---|---|
| Platform | Browser desktop (Chrome, Firefox, Edge). Responsif mobile = bonus |
| Deployment | Aplikasi web mandiri (satu file HTML atau hosting sederhana) |
| Offline | Berfungsi tanpa internet setelah dimuat pertama kali |
| Impor Excel | Mendukung impor dari format Excel yang sudah ada (`.xlsx`) |
| Ekspor | Mendukung ekspor ke `.xlsx`, `.csv`, dan `.json` |
| Error handling | Pembagian nol → tampilkan "—". File rusak → pesan error jelas |

---

## 7. Struktur Data Aplikasi

```json
{
  "versi": "1.0",
  "cabang": {
    "nama": "PT Asuransi Kredit Indonesia Cabang Cirebon",
    "wilayah": "Kanwil Jakarta II",
    "tahun_berjalan": 2024,
    "tahun_sebelumnya": 2023
  },

  "rkap_tahunan": {
    "non_kur": 449.564,
    "kur": 674.346,
    "gabungan": 1123.91
  },

  "target_beban_ytd": {
    "non_kur": [null, null, null, null, null, 223, 263.5, 298, 335, 372, 407, 449.56],
    "kur":     [null, null, null, null, null, 334, 395.3, 448, 502, 558, 610.59, 674.34]
  },

  "target_premi_ytd": {
    "non_kur": [null, null, null, null, null, 7255, 8281.3, 9447, 15678, 13345, 15871, 18302],
    "kur":     [null, null, null, null, null, 41872, 48747, 55292, 62541, 68925, 74856, 78743]
  },

  "realisasi_beban": {
    "2023": [29.86, 48.37, 39.56, 20.02, 21.53, 49.89, 41.43, 122.63, 122.13, 214.69, 17.43, 312.69],
    "2024": [312.74, 12.31, 9.38, 10.54, 39.12, 8.21, 77.27, 539.27, 559.27, null, null, null]
  },

  "realisasi_premi": {
    "non_kur": [null, null, null, null, null, 10352, 11171, 13581, 14817, 16540, null, null],
    "kur":     [null, null, null, null, null, 34099, 37024, 47276, 54294, 69963, null, null]
  },

  "realisasi_beban_per_segmen": {
    "non_kur": [null, null, null, null, null, 276, 326, 379, 412, 349, null, null],
    "kur":     [null, null, null, null, null, 117, 167, 160, 164, 434.6, null, null]
  },

  "target_beban_ytd_yoy": {
    "2023": [null, 180.64, 270.97, 361.29, 451.61, 541.93, 632.26, 722.58, 812.9, 903.22, 993.54, 1083],
    "2024": [95.4, 185.299, 284.11, 378.311, 459.161, 556.615, 658.98, 749.2, 837.013, 930, 1017, 1123]
  },

  "proyeksi_bulan_berjalan": {
    "bulan": "Oktober",
    "non_kur": {
      "real_ytd_sebelumnya": 412.232,
      "real_paruh1": 27.6,
      "potensi_paruh2": 16.4,
      "target_ytd_berjalan": 372.27
    },
    "kur": {
      "real_ytd_sebelumnya": 163.501,
      "real_paruh1": 0,
      "potensi_paruh2": 163.6,
      "target_ytd_berjalan": 558.4
    }
  }
}
```

**Catatan:** Seluruh angka beban dan premi dalam satuan **juta Rupiah**. Index array = bulan (0=Januari, 11=Desember). `null` = data belum tersedia.

---

## 8. Ringkasan Seluruh Rumus

| # | Parameter | Rumus | Sehat | Modul |
|---|---|---|---|---|
| 1 | Pencapaian Nominal | `(Realisasi Beban YTD / Target Beban YTD) × 100%` | < 100% | Nominal |
| 2 | Pencapaian RKAP | `(Realisasi Beban YTD / RKAP Tahunan) × 100%` | < 100% | Nominal |
| 3 | Asumsi Total YTD | `Real YTD bulan lalu + Real Paruh 1 + Potensi Paruh 2` | — | Nominal |
| 4 | Proyeksi Pencapaian | `(Asumsi Total YTD / Target YTD Bulan Berjalan) × 100%` | < 100% | Nominal |
| 5 | Sisa Anggaran | `Target YTD Bulan Berjalan - Asumsi Total YTD` | > 0 | Nominal |
| 6 | Rasio Beban | `(Beban Pemasaran / Premi) × 100%` | Semakin kecil semakin baik | Rasio |
| 7 | Pencapaian Rasio | `(Rasio Realisasi / Rasio Target) × 100%` | < 100% | Rasio |
| 8 | Pertumbuhan YoY | `((Real YTD Tahun Ini - Real YTD Tahun Lalu) / Real YTD Tahun Lalu) × 100%` | ≤ 0% | YoY |
| 9 | Gabungan (semua) | `Non KUR + KUR` | — | Semua |

---

## 9. Rekomendasi Teknis

| Aspek | Rekomendasi |
|---|---|
| Arsitektur | Single Page Application (SPA) — React |
| Styling | Tailwind CSS |
| Grafik | Recharts atau Chart.js |
| Penyimpanan | React state + localStorage (backup) + Ekspor/Impor JSON/XLSX |
| Bahasa | Seluruh UI dalam Bahasa Indonesia |
| Impor/Ekspor | Library SheetJS (xlsx) untuk baca/tulis Excel |
| Deployment | File statis (bisa di-host di mana saja, atau dibuka langsung dari komputer) |

---

## 10. Urutan Prioritas Pengembangan

### Fase 1 — Kalkulator Inti (mereplikasi Excel)
- Input profil cabang + RKAP tahunan
- Input data bulanan (target, realisasi, per segmen)
- Tabel Nominal lengkap dengan proyeksi paruh bulan + sisa anggaran
- Tabel Rasio per bulan dengan % pencapaian
- Tabel YoY perbandingan per bulan
- Gabungan otomatis (Non KUR + KUR)
- Kode warna otomatis (hijau/kuning/merah)
- Penanganan pembagian nol dan data kosong

### Fase 2 — Dasbor & Grafik
- Tiga kartu ringkasan parameter di atas halaman
- Grafik tren beban bulanan
- Grafik rasio per bulan per segmen
- Grafik perbandingan YoY berdampingan
- Grafik kumulatif YTD vs target

### Fase 3 — Simulasi Interaktif
- Slider/input "Bagaimana Jika" untuk beban dan premi
- Perhitungan ulang real-time ketiga parameter
- Proyeksi sisa anggaran dan bulan "kehabisan" anggaran

### Fase 4 — Manajemen Data
- Ekspor data ke JSON dan Excel
- Impor data dari JSON dan Excel (format sesuai file sumber Cirebon)
- Pengingat simpan + peringatan saat menutup halaman
- Validasi format file saat impor
- localStorage sebagai backup otomatis sesi kerja

### Fase 5 — Fitur Lanjutan
- Notifikasi proyektif ("akan melebihi target pada bulan X")
- Dukungan versi RKAP sebelum/sesudah revisi
- Dukungan multi-cabang (simpan beberapa profil cabang)
- Cetak/ekspor laporan ringkasan (PDF)