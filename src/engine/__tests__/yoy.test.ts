import { describe, it, expect } from 'vitest'
import { hitungYoY, hitungYoYGabungan } from '../yoy'
import type { DataBulanan } from '../types'

describe('hitungYoY', () => {
  it('calculates positive growth (bahaya)', () => {
    const tahunIni: DataBulanan = [100, 50, null, null, null, null, null, null, null, null, null, null]
    const tahunLalu: DataBulanan = [50, 30, null, null, null, null, null, null, null, null, null, null]

    const hasil = hitungYoY(tahunIni, tahunLalu, 1)

    expect(hasil.realisasiTahunIni).toBe(150)
    expect(hasil.realisasiTahunLalu).toBe(80)
    expect(hasil.pertumbuhanPersen).toBeCloseTo(87.5, 0)
    expect(hasil.status).toBe('bahaya')
  })

  it('calculates negative growth (aman)', () => {
    const tahunIni: DataBulanan = [30, 20, null, null, null, null, null, null, null, null, null, null]
    const tahunLalu: DataBulanan = [50, 30, null, null, null, null, null, null, null, null, null, null]

    const hasil = hitungYoY(tahunIni, tahunLalu, 1)

    expect(hasil.realisasiTahunIni).toBe(50)
    expect(hasil.realisasiTahunLalu).toBe(80)
    expect(hasil.pertumbuhanPersen).toBe(-37.5)
    expect(hasil.status).toBe('aman')
  })

  it('handles zero previous year', () => {
    const tahunIni: DataBulanan = [100, null, null, null, null, null, null, null, null, null, null, null]
    const tahunLalu: DataBulanan = Array(12).fill(null)

    const hasil = hitungYoY(tahunIni, tahunLalu, 0)

    expect(hasil.pertumbuhanPersen).toBeNull()
    expect(hasil.status).toBe('aman')
  })

  it('exactly 0% growth is aman', () => {
    const tahunIni: DataBulanan = [100, null, null, null, null, null, null, null, null, null, null, null]
    const tahunLalu: DataBulanan = [100, null, null, null, null, null, null, null, null, null, null, null]

    const hasil = hitungYoY(tahunIni, tahunLalu, 0)

    expect(hasil.pertumbuhanPersen).toBe(0)
    expect(hasil.status).toBe('aman')
  })
})

describe('hitungYoYGabungan', () => {
  it('combines correctly', () => {
    const yoyNK = hitungYoY(
      [100, null, null, null, null, null, null, null, null, null, null, null],
      [80, null, null, null, null, null, null, null, null, null, null, null],
      0
    )
    const yoyK = hitungYoY(
      [50, null, null, null, null, null, null, null, null, null, null, null],
      [60, null, null, null, null, null, null, null, null, null, null, null],
      0
    )

    const gabungan = hitungYoYGabungan(yoyNK, yoyK)

    expect(gabungan.realisasiTahunIni).toBe(150)
    expect(gabungan.realisasiTahunLalu).toBe(140)
    expect(gabungan.pertumbuhanPersen).toBeCloseTo(7.14, 0)
    expect(gabungan.status).toBe('bahaya')
  })
})
