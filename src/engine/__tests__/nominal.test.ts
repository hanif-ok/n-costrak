import { describe, it, expect } from 'vitest'
import { hitungNominal, hitungNominalGabungan, hitungRealisasiYTD, getStatusRAG } from '../nominal'
import type { DataBulanan } from '../types'

describe('getStatusRAG', () => {
  it('returns aman for null', () => {
    expect(getStatusRAG(null)).toBe('aman')
  })
  it('returns aman for < 80%', () => {
    expect(getStatusRAG(79.99)).toBe('aman')
  })
  it('returns perhatian for exactly 80%', () => {
    expect(getStatusRAG(80)).toBe('perhatian')
  })
  it('returns perhatian for 99.99%', () => {
    expect(getStatusRAG(99.99)).toBe('perhatian')
  })
  it('returns bahaya for exactly 100%', () => {
    expect(getStatusRAG(100)).toBe('bahaya')
  })
  it('returns bahaya for > 100%', () => {
    expect(getStatusRAG(122.6)).toBe('bahaya')
  })
})

describe('hitungRealisasiYTD', () => {
  it('sums values up to bulanIndex', () => {
    const data: DataBulanan = [10, 20, 30, 40, null, null, null, null, null, null, null, null]
    expect(hitungRealisasiYTD(data, 2)).toBe(60)
  })
  it('skips null values', () => {
    const data: DataBulanan = [10, null, 30, null, null, null, null, null, null, null, null, null]
    expect(hitungRealisasiYTD(data, 3)).toBe(40)
  })
  it('returns 0 for all null', () => {
    const data: DataBulanan = Array(12).fill(null)
    expect(hitungRealisasiYTD(data, 5)).toBe(0)
  })
})

describe('hitungNominal', () => {
  it('calculates correctly for Cirebon Non KUR data', () => {
    // Non KUR: realisasi beban per bulan, target YTD September = 334.8
    const realisasi: DataBulanan = [null, null, null, null, null, 276, 50, 53, 33.232, null, null, null]
    const targetYTD: DataBulanan = [null, null, null, null, null, 223, 263.5, 298, 334.8, 372.27, 407, 449.56]
    const rkap = 449.564

    const hasil = hitungNominal(realisasi, targetYTD, rkap, 8) // September (index 8)

    expect(hasil.realisasiYTD).toBeCloseTo(412.232, 1)
    expect(hasil.targetYTD).toBe(334.8)
    expect(hasil.pencapaianPersen).toBeGreaterThan(100) // Over target
    expect(hasil.status).toBe('bahaya')
  })

  it('calculates sisa anggaran correctly', () => {
    const realisasi: DataBulanan = [50, 50, null, null, null, null, null, null, null, null, null, null]
    const targetYTD: DataBulanan = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
    const rkap = 1200

    const hasil = hitungNominal(realisasi, targetYTD, rkap, 1)

    expect(hasil.realisasiYTD).toBe(100)
    expect(hasil.targetYTD).toBe(200)
    expect(hasil.sisaAnggaran).toBe(100)
    expect(hasil.pencapaianPersen).toBe(50)
    expect(hasil.status).toBe('aman')
  })

  it('handles zero target gracefully', () => {
    const realisasi: DataBulanan = [50, null, null, null, null, null, null, null, null, null, null, null]
    const targetYTD: DataBulanan = Array(12).fill(null)
    const rkap = 0

    const hasil = hitungNominal(realisasi, targetYTD, rkap, 0)
    expect(hasil.pencapaianPersen).toBeNull()
    expect(hasil.pencapaianRKAP).toBeNull()
  })
})

describe('hitungNominalGabungan', () => {
  it('combines Non KUR and KUR correctly', () => {
    const nonKur = hitungNominal(
      [50, 50, null, null, null, null, null, null, null, null, null, null],
      [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
      1200,
      1
    )
    const kur = hitungNominal(
      [30, 30, null, null, null, null, null, null, null, null, null, null],
      [80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960],
      960,
      1
    )

    const gabungan = hitungNominalGabungan(nonKur, kur, 2160)

    expect(gabungan.realisasiYTD).toBe(160)
    expect(gabungan.targetYTD).toBe(360)
    expect(gabungan.pencapaianPersen).toBeCloseTo(44.44, 1)
    expect(gabungan.status).toBe('aman')
  })
})
