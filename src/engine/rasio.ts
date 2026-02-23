import type { HasilRasio, DataBulanan } from './types';
import { getStatusRAG, hitungRealisasiYTD } from './nominal';

/** Calculate Rasio Beban Pemasaran */
export function hitungRasio(
  realisasiBeban: DataBulanan,
  realisasiPremi: DataBulanan,
  targetBeban: DataBulanan,
  targetPremi: DataBulanan,
  bulanIndex: number,
): HasilRasio {
  const bebanYTD = hitungRealisasiYTD(realisasiBeban, bulanIndex);
  const premiYTD = hitungRealisasiYTD(realisasiPremi, bulanIndex);
  const targetBebanYTD = targetBeban[bulanIndex] ?? 0;
  const targetPremiYTD = targetPremi[bulanIndex] ?? 0;

  const rasioTarget = targetPremiYTD > 0
    ? Math.round((targetBebanYTD / targetPremiYTD) * 10000) / 100
    : null;

  const rasioRealisasi = premiYTD > 0
    ? Math.round((bebanYTD / premiYTD) * 10000) / 100
    : null;

  const pencapaianRasio = (rasioTarget !== null && rasioTarget > 0 && rasioRealisasi !== null)
    ? Math.round((rasioRealisasi / rasioTarget) * 10000) / 100
    : null;

  return {
    rasioTarget,
    rasioRealisasi,
    pencapaianRasio,
    status: getStatusRAG(pencapaianRasio),
  };
}

/** Calculate Rasio Gabungan */
export function hitungRasioGabungan(
  realisasiBebanNonKur: DataBulanan,
  realisasiBebanKur: DataBulanan,
  realisasiPremiNonKur: DataBulanan,
  realisasiPremiKur: DataBulanan,
  targetBebanNonKur: DataBulanan,
  targetBebanKur: DataBulanan,
  targetPremiNonKur: DataBulanan,
  targetPremiKur: DataBulanan,
  bulanIndex: number,
): HasilRasio {
  const bebanNonKur = hitungRealisasiYTD(realisasiBebanNonKur, bulanIndex);
  const bebanKur = hitungRealisasiYTD(realisasiBebanKur, bulanIndex);
  const premiNonKur = hitungRealisasiYTD(realisasiPremiNonKur, bulanIndex);
  const premiKur = hitungRealisasiYTD(realisasiPremiKur, bulanIndex);
  const tgtBebanNonKur = targetBebanNonKur[bulanIndex] ?? 0;
  const tgtBebanKur = targetBebanKur[bulanIndex] ?? 0;
  const tgtPremiNonKur = targetPremiNonKur[bulanIndex] ?? 0;
  const tgtPremiKur = targetPremiKur[bulanIndex] ?? 0;

  const totalBeban = bebanNonKur + bebanKur;
  const totalPremi = premiNonKur + premiKur;
  const totalTargetBeban = tgtBebanNonKur + tgtBebanKur;
  const totalTargetPremi = tgtPremiNonKur + tgtPremiKur;

  const rasioTarget = totalTargetPremi > 0
    ? Math.round((totalTargetBeban / totalTargetPremi) * 10000) / 100
    : null;

  const rasioRealisasi = totalPremi > 0
    ? Math.round((totalBeban / totalPremi) * 10000) / 100
    : null;

  const pencapaianRasio = (rasioTarget !== null && rasioTarget > 0 && rasioRealisasi !== null)
    ? Math.round((rasioRealisasi / rasioTarget) * 10000) / 100
    : null;

  return {
    rasioTarget,
    rasioRealisasi,
    pencapaianRasio,
    status: getStatusRAG(pencapaianRasio),
  };
}
