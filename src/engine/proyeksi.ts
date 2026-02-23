import type { HasilProyeksi } from './types';
import { getStatusRAG } from './nominal';

/** Calculate mid-month projection */
export function hitungProyeksi(
  realYTDSebelumnya: number,
  realParuh1: number,
  potensiParuh2: number,
  targetYTDBerjalan: number,
): HasilProyeksi {
  const asumsiYTD = Math.round((realYTDSebelumnya + realParuh1 + potensiParuh2) * 100) / 100;

  const pencapaianProyeksi = targetYTDBerjalan > 0
    ? Math.round((asumsiYTD / targetYTDBerjalan) * 10000) / 100
    : null;

  const sisaAnggaran = Math.round((targetYTDBerjalan - asumsiYTD) * 100) / 100;

  return {
    realYTDSebelumnya,
    realParuh1,
    potensiParuh2,
    asumsiYTD,
    targetYTDBerjalan,
    pencapaianProyeksi,
    sisaAnggaran,
    status: getStatusRAG(pencapaianProyeksi),
  };
}
