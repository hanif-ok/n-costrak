export type StatusRAG = 'aman' | 'perhatian' | 'bahaya';

export type Segmen = 'nonKur' | 'kur' | 'gabungan';

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export interface ProfilCabang {
  nama: string;
  wilayah: string;
  tahunBerjalan: number;
  tahunSebelumnya: number;
}

export interface DataRKAP {
  nonKur: number;
  kur: number;
  gabungan: number; // auto-calculated
}

export interface DataRKAPRevisi {
  awal: DataRKAP;
  revisi: DataRKAP | null;  // null = no revision yet
  aktif: 'awal' | 'revisi';
}

// Array of 12 months (index 0 = Jan, 11 = Dec), null = no data
export type DataBulanan = (number | null)[];

export interface DataTarget {
  bebanYTD: { nonKur: DataBulanan; kur: DataBulanan };
  premiYTD: { nonKur: DataBulanan; kur: DataBulanan };
}

export interface DataRealisasi {
  beban: { nonKur: DataBulanan; kur: DataBulanan };
  premi: { nonKur: DataBulanan; kur: DataBulanan };
}

export interface DataTahunLalu {
  beban: { nonKur: DataBulanan; kur: DataBulanan };
}

export interface HasilNominal {
  realisasiYTD: number;
  targetYTD: number;
  pencapaianPersen: number | null;
  pencapaianRKAP: number | null;
  sisaAnggaran: number;
  status: StatusRAG;
}

export interface HasilRasio {
  rasioTarget: number | null;
  rasioRealisasi: number | null;
  pencapaianRasio: number | null;
  status: StatusRAG;
}

export interface HasilYoY {
  realisasiTahunIni: number;
  realisasiTahunLalu: number;
  pertumbuhanPersen: number | null;
  status: StatusRAG;
}

export interface HasilProyeksi {
  realYTDSebelumnya: number;
  realParuh1: number;
  potensiParuh2: number;
  asumsiYTD: number;
  targetYTDBerjalan: number;
  pencapaianProyeksi: number | null;
  sisaAnggaran: number;
  status: StatusRAG;
}

export interface ProfilCabangSnapshot {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  profil: ProfilCabang;
  rkapRevisi: DataRKAPRevisi;
  targetBebanYTD: { nonKur: DataBulanan; kur: DataBulanan };
  targetPremiYTD: { nonKur: DataBulanan; kur: DataBulanan };
  realisasiBeban: { nonKur: DataBulanan; kur: DataBulanan };
  realisasiPremi: { nonKur: DataBulanan; kur: DataBulanan };
  realisasiBebanTahunLalu: { nonKur: DataBulanan; kur: DataBulanan };
  proyeksi: {
    bulanIndex: number;
    nonKur: { realParuh1: number; potensiParuh2: number };
    kur: { realParuh1: number; potensiParuh2: number };
  };
}

export function emptyDataBulanan(): DataBulanan {
  return Array(12).fill(null);
}
