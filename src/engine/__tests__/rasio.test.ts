import { describe, it, expect } from 'vitest'
import { hitungRasio, hitungRasioGabungan } from '../rasio'
import type { DataBulanan } from '../types'

describe('hitungRasio', () => {
  it('calculates ratio correctly for Cirebon Juni data', () => {
    // Non KUR Juni: Premi Target 7255, Beban Target 223, Premi Real 10352, Beban Real 276
    const realisasiBeban: DataBulanan = [null, null, null, null, null, 276, null, null, null, null, null, null]
    const realisasiPremi: DataBulanan = [null, null, null, null, null, 10352, null, null, null, null, null, null]
    const targetBeban: DataBulanan = [null, null, null, null, null, 223, null, null, null, null, null, null]
    const targetPremi: DataBulanan = [null, null, null, null, null, 7255, null, null, null, null, null, null]

    const hasil = hitungRasio(realisasiBeban, realisasiPremi, targetBeban, targetPremi, 5)

    expect(hasil.rasioTarget).toBeCloseTo(3.07, 0)
    expect(hasil.rasioRealisasi).toBeCloseTo(2.67, 0)
    expect(hasil.pencapaianRasio).toBeCloseTo(86.7, 0)
    expect(hasil.status).toBe('perhatian')
  })

  it('handles zero premi (division by zero)', () => {
    const realisasiBeban: DataBulanan = [100, null, null, null, null, null, null, null, null, null, null, null]
    const realisasiPremi: DataBulanan = [0, null, null, null, null, null, null, null, null, null, null, null]
    const targetBeban: DataBulanan = [50, null, null, null, null, null, null, null, null, null, null, null]
    const targetPremi: DataBulanan = [0, null, null, null, null, null, null, null, null, null, null, null]

    const hasil = hitungRasio(realisasiBeban, realisasiPremi, targetBeban, targetPremi, 0)

    expect(hasil.rasioRealisasi).toBeNull()
    expect(hasil.rasioTarget).toBeNull()
    expect(hasil.pencapaianRasio).toBeNull()
    expect(hasil.status).toBe('aman')
  })

  it('very efficient ratio returns aman status', () => {
    const realisasiBeban: DataBulanan = [10, null, null, null, null, null, null, null, null, null, null, null]
    const realisasiPremi: DataBulanan = [1000, null, null, null, null, null, null, null, null, null, null, null]
    const targetBeban: DataBulanan = [50, null, null, null, null, null, null, null, null, null, null, null]
    const targetPremi: DataBulanan = [1000, null, null, null, null, null, null, null, null, null, null, null]

    const hasil = hitungRasio(realisasiBeban, realisasiPremi, targetBeban, targetPremi, 0)

    expect(hasil.rasioRealisasi).toBe(1)
    expect(hasil.pencapaianRasio).toBe(20) // 1% / 5% = 20%
    expect(hasil.status).toBe('aman')
  })
})

describe('hitungRasioGabungan', () => {
  it('combines Non KUR and KUR correctly for Cirebon Juni', () => {
    const bebanNK: DataBulanan = [null, null, null, null, null, 276, null, null, null, null, null, null]
    const bebanK: DataBulanan = [null, null, null, null, null, 117, null, null, null, null, null, null]
    const premiNK: DataBulanan = [null, null, null, null, null, 10352, null, null, null, null, null, null]
    const premiK: DataBulanan = [null, null, null, null, null, 34099, null, null, null, null, null, null]
    const tgtBebanNK: DataBulanan = [null, null, null, null, null, 223, null, null, null, null, null, null]
    const tgtBebanK: DataBulanan = [null, null, null, null, null, 334, null, null, null, null, null, null]
    const tgtPremiNK: DataBulanan = [null, null, null, null, null, 7255, null, null, null, null, null, null]
    const tgtPremiK: DataBulanan = [null, null, null, null, null, 41872, null, null, null, null, null, null]

    const hasil = hitungRasioGabungan(bebanNK, bebanK, premiNK, premiK, tgtBebanNK, tgtBebanK, tgtPremiNK, tgtPremiK, 5)

    // Gabungan: Premi 49127+44451, Beban 557+393, Rasio target 1.13%, Rasio real ~0.88%
    expect(hasil.rasioRealisasi).toBeCloseTo(0.88, 0)
    expect(hasil.pencapaianRasio).toBeCloseTo(78, 0)
    expect(hasil.status).toBe('aman')
  })
})
