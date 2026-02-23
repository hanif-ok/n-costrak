import type { StatusRAG, HasilNominal, DataBulanan } from './types';

export function getStatusRAG(persen: number | null): StatusRAG {
  if (persen === null) return 'aman';
  if (persen >= 100) return 'bahaya';
  if (persen >= 80) return 'perhatian';
  return 'aman';
}

/** Sum realisasi beban from Jan up to and including bulanIndex */
export function hitungRealisasiYTD(realisasi: DataBulanan, bulanIndex: number): number {
  let total = 0;
  for (let i = 0; i <= bulanIndex && i < realisasi.length; i++) {
    if (realisasi[i] !== null) {
      total += realisasi[i]!;
    }
  }
  return Math.round(total * 100) / 100;
}

/** Calculate Nominal parameter */
export function hitungNominal(
  realisasiBeban: DataBulanan,
  targetBebanYTD: DataBulanan,
  rkap: number,
  bulanIndex: number,
): HasilNominal {
  const realisasiYTD = hitungRealisasiYTD(realisasiBeban, bulanIndex);
  const targetYTD = targetBebanYTD[bulanIndex] ?? 0;

  const pencapaianPersen = targetYTD > 0
    ? Math.round((realisasiYTD / targetYTD) * 10000) / 100
    : null;

  const pencapaianRKAP = rkap > 0
    ? Math.round((realisasiYTD / rkap) * 10000) / 100
    : null;

  const sisaAnggaran = Math.round((targetYTD - realisasiYTD) * 100) / 100;

  return {
    realisasiYTD,
    targetYTD,
    pencapaianPersen,
    pencapaianRKAP,
    sisaAnggaran,
    status: getStatusRAG(pencapaianPersen),
  };
}

/** Calculate Gabungan (Non KUR + KUR combined) */
export function hitungNominalGabungan(
  hasilNonKur: HasilNominal,
  hasilKur: HasilNominal,
  rkapGabungan: number,
): HasilNominal {
  const realisasiYTD = Math.round((hasilNonKur.realisasiYTD + hasilKur.realisasiYTD) * 100) / 100;
  const targetYTD = Math.round((hasilNonKur.targetYTD + hasilKur.targetYTD) * 100) / 100;

  const pencapaianPersen = targetYTD > 0
    ? Math.round((realisasiYTD / targetYTD) * 10000) / 100
    : null;

  const pencapaianRKAP = rkapGabungan > 0
    ? Math.round((realisasiYTD / rkapGabungan) * 10000) / 100
    : null;

  const sisaAnggaran = Math.round((targetYTD - realisasiYTD) * 100) / 100;

  return {
    realisasiYTD,
    targetYTD,
    pencapaianPersen,
    pencapaianRKAP,
    sisaAnggaran,
    status: getStatusRAG(pencapaianPersen),
  };
}
