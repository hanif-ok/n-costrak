import { useMemo } from 'react'
import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { useAppStore } from '../store/appStore'
import { hitungNominal, hitungNominalGabungan } from '../engine/nominal'
import { hitungRasio, hitungRasioGabungan } from '../engine/rasio'
import { hitungYoY, hitungYoYGabungan } from '../engine/yoy'
import { hitungProyeksi } from '../engine/proyeksi'
import { hitungRealisasiYTD } from '../engine/nominal'
import { kumpulkanPeringatan, proyeksiMelebihiTarget } from '../engine/peringatan'
import type { HasilNominal, HasilRasio, HasilYoY, HasilProyeksi, DataBulanan } from '../engine/types'
import type { Peringatan } from '../engine/peringatan'

export interface BPRSegmen {
  nominal: HasilNominal
  rasio: HasilRasio
  yoy: HasilYoY
}

export interface BPRData {
  nonKur: BPRSegmen
  kur: BPRSegmen
  gabungan: BPRSegmen
  proyeksiNonKur: HasilProyeksi | null
  proyeksiKur: HasilProyeksi | null
  proyeksiGabungan: HasilProyeksi | null
  peringatan: Peringatan[]
  bulanMelebihiTarget: string | null
  bulanAktif: number
}

function gabungBeban(a: DataBulanan, b: DataBulanan): DataBulanan {
  return a.map((v, i) => {
    const va = v ?? 0
    const vb = b[i] ?? 0
    return v !== null || b[i] !== null ? va + vb : null
  })
}

export function useBPRData(): BPRData {
  const bulanAktif = useAppStore((s) => s.bulanAktif)
  const rkap = useProfilStore((s) => getRKAPAktif(s))
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiPremi = useInputStore((s) => s.realisasiPremi)
  const realisasiTahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)
  const proyeksiInput = useInputStore((s) => s.proyeksi)

  return useMemo(() => {
    // Nominal
    const nomNonKur = hitungNominal(realisasiBeban.nonKur, targetBeban.nonKur, rkap.nonKur, bulanAktif)
    const nomKur = hitungNominal(realisasiBeban.kur, targetBeban.kur, rkap.kur, bulanAktif)
    const nomGab = hitungNominalGabungan(nomNonKur, nomKur, rkap.gabungan)

    // Rasio
    const rasNonKur = hitungRasio(realisasiBeban.nonKur, realisasiPremi.nonKur, targetBeban.nonKur, targetPremi.nonKur, bulanAktif)
    const rasKur = hitungRasio(realisasiBeban.kur, realisasiPremi.kur, targetBeban.kur, targetPremi.kur, bulanAktif)
    const rasGab = hitungRasioGabungan(
      realisasiBeban.nonKur, realisasiBeban.kur,
      realisasiPremi.nonKur, realisasiPremi.kur,
      targetBeban.nonKur, targetBeban.kur,
      targetPremi.nonKur, targetPremi.kur,
      bulanAktif
    )

    // YoY
    const yoyNonKur = hitungYoY(realisasiBeban.nonKur, realisasiTahunLalu.nonKur, bulanAktif)
    const yoyKur = hitungYoY(realisasiBeban.kur, realisasiTahunLalu.kur, bulanAktif)
    const yoyGab = hitungYoYGabungan(yoyNonKur, yoyKur)

    // Proyeksi
    let proyeksiNonKur: HasilProyeksi | null = null
    let proyeksiKur: HasilProyeksi | null = null
    let proyeksiGabungan: HasilProyeksi | null = null

    const pBulan = proyeksiInput.bulanIndex
    if (pBulan > 0) {
      const realYTDnonKurPrev = hitungRealisasiYTD(realisasiBeban.nonKur, pBulan - 1)
      const realYTDkurPrev = hitungRealisasiYTD(realisasiBeban.kur, pBulan - 1)

      proyeksiNonKur = hitungProyeksi(
        realYTDnonKurPrev,
        proyeksiInput.nonKur.realParuh1,
        proyeksiInput.nonKur.potensiParuh2,
        targetBeban.nonKur[pBulan] ?? 0
      )
      proyeksiKur = hitungProyeksi(
        realYTDkurPrev,
        proyeksiInput.kur.realParuh1,
        proyeksiInput.kur.potensiParuh2,
        targetBeban.kur[pBulan] ?? 0
      )
      proyeksiGabungan = hitungProyeksi(
        realYTDnonKurPrev + realYTDkurPrev,
        proyeksiInput.nonKur.realParuh1 + proyeksiInput.kur.realParuh1,
        proyeksiInput.nonKur.potensiParuh2 + proyeksiInput.kur.potensiParuh2,
        (targetBeban.nonKur[pBulan] ?? 0) + (targetBeban.kur[pBulan] ?? 0)
      )
    }

    // Peringatan
    const peringatan = [
      ...kumpulkanPeringatan(nomNonKur, rasNonKur, yoyNonKur, 'Non KUR'),
      ...kumpulkanPeringatan(nomKur, rasKur, yoyKur, 'KUR'),
      ...kumpulkanPeringatan(nomGab, rasGab, yoyGab, 'Gabungan'),
    ]

    // Gabungan beban for projection
    const gabBeban = gabungBeban(realisasiBeban.nonKur, realisasiBeban.kur)
    const gabTargetBeban: DataBulanan = targetBeban.nonKur.map((v, i) => {
      const a = v ?? 0
      const b = targetBeban.kur[i] ?? 0
      return v !== null || targetBeban.kur[i] !== null ? a + b : null
    })
    const bulanMelebihiTarget = proyeksiMelebihiTarget(gabBeban, gabTargetBeban, bulanAktif)

    return {
      nonKur: { nominal: nomNonKur, rasio: rasNonKur, yoy: yoyNonKur },
      kur: { nominal: nomKur, rasio: rasKur, yoy: yoyKur },
      gabungan: { nominal: nomGab, rasio: rasGab, yoy: yoyGab },
      proyeksiNonKur,
      proyeksiKur,
      proyeksiGabungan,
      peringatan,
      bulanMelebihiTarget,
      bulanAktif,
    }
  }, [bulanAktif, rkap, targetBeban, targetPremi, realisasiBeban, realisasiPremi, realisasiTahunLalu, proyeksiInput])
}
