import type { StatusRAG, HasilYoY, DataBulanan } from './types';
import { hitungRealisasiYTD } from './nominal';

function getStatusYoY(persen: number | null): StatusRAG {
  if (persen === null) return 'aman';
  if (persen > 0) return 'bahaya';
  return 'aman';
}

/** Calculate Year-on-Year growth */
export function hitungYoY(
  realisasiTahunIni: DataBulanan,
  realisasiTahunLalu: DataBulanan,
  bulanIndex: number,
): HasilYoY {
  const ytdIni = hitungRealisasiYTD(realisasiTahunIni, bulanIndex);
  const ytdLalu = hitungRealisasiYTD(realisasiTahunLalu, bulanIndex);

  const pertumbuhanPersen = ytdLalu > 0
    ? Math.round(((ytdIni - ytdLalu) / ytdLalu) * 10000) / 100
    : null;

  return {
    realisasiTahunIni: ytdIni,
    realisasiTahunLalu: ytdLalu,
    pertumbuhanPersen,
    status: getStatusYoY(pertumbuhanPersen),
  };
}

/** Calculate YoY Gabungan */
export function hitungYoYGabungan(
  hasilNonKur: HasilYoY,
  hasilKur: HasilYoY,
): HasilYoY {
  const realisasiTahunIni = Math.round((hasilNonKur.realisasiTahunIni + hasilKur.realisasiTahunIni) * 100) / 100;
  const realisasiTahunLalu = Math.round((hasilNonKur.realisasiTahunLalu + hasilKur.realisasiTahunLalu) * 100) / 100;

  const pertumbuhanPersen = realisasiTahunLalu > 0
    ? Math.round(((realisasiTahunIni - realisasiTahunLalu) / realisasiTahunLalu) * 10000) / 100
    : null;

  return {
    realisasiTahunIni,
    realisasiTahunLalu,
    pertumbuhanPersen,
    status: pertumbuhanPersen !== null && pertumbuhanPersen > 0 ? 'bahaya' : 'aman',
  };
}
