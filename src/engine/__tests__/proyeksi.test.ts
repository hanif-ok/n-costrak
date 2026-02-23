import { describe, it, expect } from 'vitest'
import { hitungProyeksi } from '../proyeksi'

describe('hitungProyeksi', () => {
  it('calculates Cirebon Oktober Non KUR projection', () => {
    // Real YTD Sep: 412.232, Real 1-15 Oct: 27.6, Potensi 16-31: 16.4, Target YTD Oct: 372.27
    const hasil = hitungProyeksi(412.232, 27.6, 16.4, 372.27)

    expect(hasil.asumsiYTD).toBeCloseTo(456.232, 1)
    expect(hasil.pencapaianProyeksi).toBeCloseTo(122.55, 0) // Over target
    expect(hasil.sisaAnggaran).toBeLessThan(0) // Negative
    expect(hasil.status).toBe('bahaya')
  })

  it('calculates Cirebon Oktober KUR projection', () => {
    // Real YTD Sep: 163.501, Real 1-15 Oct: 0, Potensi 16-31: 163.6, Target YTD Oct: 558.4
    const hasil = hitungProyeksi(163.501, 0, 163.6, 558.4)

    expect(hasil.asumsiYTD).toBeCloseTo(327.101, 1)
    expect(hasil.pencapaianProyeksi).toBeLessThan(100)
    expect(hasil.sisaAnggaran).toBeGreaterThan(0)
    expect(hasil.status).toBe('aman')
  })

  it('handles zero target', () => {
    const hasil = hitungProyeksi(100, 10, 10, 0)

    expect(hasil.asumsiYTD).toBe(120)
    expect(hasil.pencapaianProyeksi).toBeNull()
    expect(hasil.sisaAnggaran).toBe(-120)
  })
})
