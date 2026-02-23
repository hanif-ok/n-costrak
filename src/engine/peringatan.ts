import type { StatusRAG, HasilNominal, HasilRasio, HasilYoY, DataBulanan } from './types';
import { hitungRealisasiYTD } from './nominal';
import { NAMA_BULAN } from './types';

export interface Peringatan {
  tipe: StatusRAG;
  parameter: string;
  pesan: string;
}

export function kumpulkanPeringatan(
  nominal: HasilNominal,
  rasio: HasilRasio,
  yoy: HasilYoY,
  segmen: string,
): Peringatan[] {
  const hasil: Peringatan[] = [];

  if (nominal.pencapaianPersen !== null) {
    if (nominal.pencapaianPersen >= 100) {
      hasil.push({
        tipe: 'bahaya',
        parameter: 'Nominal',
        pesan: `${segmen}: Realisasi beban telah MELEBIHI target YTD (${nominal.pencapaianPersen.toFixed(1)}%), sisa anggaran ${nominal.sisaAnggaran.toFixed(2)} juta`,
      });
    } else if (nominal.pencapaianPersen >= 80) {
      hasil.push({
        tipe: 'perhatian',
        parameter: 'Nominal',
        pesan: `${segmen}: Realisasi beban mendekati target YTD (${nominal.pencapaianPersen.toFixed(1)}%)`,
      });
    }
  } else if (nominal.sisaAnggaran < 0) {
    // Only show separate negative-budget warning when pencapaianPersen is null (no target set)
    hasil.push({
      tipe: 'bahaya',
      parameter: 'Nominal',
      pesan: `${segmen}: Sisa anggaran sudah NEGATIF (${nominal.sisaAnggaran.toFixed(2)} juta)`,
    });
  }

  if (rasio.pencapaianRasio !== null) {
    if (rasio.pencapaianRasio >= 100) {
      hasil.push({
        tipe: 'bahaya',
        parameter: 'Rasio',
        pesan: `${segmen}: Rasio beban pemasaran MELEBIHI target (${rasio.pencapaianRasio.toFixed(1)}%)`,
      });
    } else if (rasio.pencapaianRasio >= 80) {
      hasil.push({
        tipe: 'perhatian',
        parameter: 'Rasio',
        pesan: `${segmen}: Rasio beban pemasaran mendekati target (${rasio.pencapaianRasio.toFixed(1)}%)`,
      });
    }
  }

  if (yoy.pertumbuhanPersen !== null && yoy.pertumbuhanPersen > 0) {
    hasil.push({
      tipe: 'bahaya',
      parameter: 'YoY',
      pesan: `${segmen}: Beban pemasaran TUMBUH ${yoy.pertumbuhanPersen.toFixed(1)}% dibanding tahun lalu`,
    });
  }

  return hasil;
}

/** Project which month the budget will be exceeded based on current spending rate */
export function proyeksiMelebihiTarget(
  realisasiBeban: DataBulanan,
  targetBebanYTD: DataBulanan,
  bulanTerakhirData: number,
): string | null {
  if (bulanTerakhirData < 0) return null;

  const ytdSaatIni = hitungRealisasiYTD(realisasiBeban, bulanTerakhirData);
  if (ytdSaatIni <= 0) return null;

  const rataRataPerBulan = ytdSaatIni / (bulanTerakhirData + 1);

  for (let i = bulanTerakhirData + 1; i < 12; i++) {
    const targetBulan = targetBebanYTD[i];
    if (targetBulan === null || targetBulan <= 0) continue;
    const proyeksiYTD = ytdSaatIni + rataRataPerBulan * (i - bulanTerakhirData);
    if (proyeksiYTD > targetBulan) {
      return NAMA_BULAN[i];
    }
  }

  return null;
}
