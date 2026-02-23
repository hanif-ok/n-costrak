import * as XLSX from 'xlsx'
import { NAMA_BULAN } from '../engine/types'
import type { ExportData } from './dataIO'

const SHEET_NAMES = {
  profil: 'Profil',
  targetBebanYTD: 'Target Beban YTD',
  targetPremiYTD: 'Target Premi YTD',
  realisasiBeban: 'Realisasi Beban',
  realisasiPremi: 'Realisasi Premi',
  bebanTahunLalu: 'Beban Tahun Lalu',
  proyeksi: 'Proyeksi',
} as const

function monthlyDataToAOA(
  label: string,
  dataNonKur: (number | null)[],
  dataKur: (number | null)[],
): (string | number | null)[][] {
  const header = ['Segmen', ...NAMA_BULAN.map((b) => b)]
  const rowNK: (string | number | null)[] = ['Non KUR', ...dataNonKur]
  const rowK: (string | number | null)[] = ['KUR', ...dataKur]
  return [
    [label],
    header,
    rowNK,
    rowK,
  ]
}

function aoaToMonthlyData(
  rows: (string | number | null)[][],
): { nonKur: (number | null)[]; kur: (number | null)[] } {
  // rows[0] = title, rows[1] = header, rows[2] = Non KUR, rows[3] = KUR
  const parseRow = (row: (string | number | null)[] | undefined): (number | null)[] => {
    if (!row) return Array(12).fill(null)
    return Array.from({ length: 12 }, (_, i) => {
      const val = row[i + 1]
      if (val === null || val === undefined || val === '') return null
      const num = typeof val === 'number' ? val : parseFloat(String(val))
      return isNaN(num) ? null : num
    })
  }

  return {
    nonKur: parseRow(rows[2]),
    kur: parseRow(rows[3]),
  }
}

export function eksporXLSXToFile(data: ExportData, filename: string): void {
  const wb = XLSX.utils.book_new()

  // Profil sheet
  const profilAOA: (string | number | null)[][] = [
    ['Profil Cabang'],
    ['Nama Cabang', data.profil.nama],
    ['Wilayah', data.profil.wilayah],
    ['Tahun Berjalan', data.profil.tahunBerjalan],
    ['Tahun Sebelumnya', data.profil.tahunSebelumnya],
    [],
    ['RKAP Tahunan (juta Rp)'],
    ['Non KUR', data.rkap.nonKur],
    ['KUR', data.rkap.kur],
    ['Gabungan', data.rkap.gabungan],
    [],
    ['Versi', data.versi],
    ['Tanggal Ekspor', data.tanggalEkspor],
  ]
  const wsProfil = XLSX.utils.aoa_to_sheet(profilAOA)
  XLSX.utils.book_append_sheet(wb, wsProfil, SHEET_NAMES.profil)

  // Monthly data sheets
  const sheets: { name: string; label: string; nonKur: (number | null)[]; kur: (number | null)[] }[] = [
    { name: SHEET_NAMES.targetBebanYTD, label: 'Target Beban YTD (juta Rp)', nonKur: data.targetBebanYTD.nonKur, kur: data.targetBebanYTD.kur },
    { name: SHEET_NAMES.targetPremiYTD, label: 'Target Premi YTD (juta Rp)', nonKur: data.targetPremiYTD.nonKur, kur: data.targetPremiYTD.kur },
    { name: SHEET_NAMES.realisasiBeban, label: 'Realisasi Beban (juta Rp)', nonKur: data.realisasiBeban.nonKur, kur: data.realisasiBeban.kur },
    { name: SHEET_NAMES.realisasiPremi, label: 'Realisasi Premi (juta Rp)', nonKur: data.realisasiPremi.nonKur, kur: data.realisasiPremi.kur },
    { name: SHEET_NAMES.bebanTahunLalu, label: 'Beban Tahun Lalu (juta Rp)', nonKur: data.realisasiBebanTahunLalu.nonKur, kur: data.realisasiBebanTahunLalu.kur },
  ]

  for (const sheet of sheets) {
    const aoa = monthlyDataToAOA(sheet.label, sheet.nonKur, sheet.kur)
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }

  // Proyeksi sheet
  const proyeksiAOA: (string | number | null)[][] = [
    ['Proyeksi Paruh Bulan'],
    ['Bulan Berjalan', NAMA_BULAN[data.proyeksi.bulanIndex], data.proyeksi.bulanIndex],
    [],
    ['Segmen', 'Realisasi 1-15', 'Potensi 16-31'],
    ['Non KUR', data.proyeksi.nonKur.realParuh1, data.proyeksi.nonKur.potensiParuh2],
    ['KUR', data.proyeksi.kur.realParuh1, data.proyeksi.kur.potensiParuh2],
  ]
  const wsProyeksi = XLSX.utils.aoa_to_sheet(proyeksiAOA)
  XLSX.utils.book_append_sheet(wb, wsProyeksi, SHEET_NAMES.proyeksi)

  XLSX.writeFile(wb, filename)
}

export async function imporXLSX(file: File): Promise<ExportData> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })

  // Validate required sheets
  const requiredSheets = [SHEET_NAMES.profil]
  for (const name of requiredSheets) {
    if (!wb.SheetNames.includes(name)) {
      throw new Error(`Sheet "${name}" tidak ditemukan. Pastikan file XLSX berasal dari aplikasi ini.`)
    }
  }

  // Parse Profil sheet
  const profilSheet = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[SHEET_NAMES.profil], { header: 1 })

  const profil = {
    nama: String(profilSheet[1]?.[1] ?? ''),
    wilayah: String(profilSheet[2]?.[1] ?? ''),
    tahunBerjalan: Number(profilSheet[3]?.[1]) || new Date().getFullYear(),
    tahunSebelumnya: Number(profilSheet[4]?.[1]) || new Date().getFullYear() - 1,
  }

  const rkap = {
    nonKur: Number(profilSheet[7]?.[1]) || 0,
    kur: Number(profilSheet[8]?.[1]) || 0,
    gabungan: Number(profilSheet[9]?.[1]) || 0,
  }

  // Parse monthly data sheets
  function parseMonthlySheet(sheetName: string): { nonKur: (number | null)[]; kur: (number | null)[] } {
    if (!wb.SheetNames.includes(sheetName)) {
      return { nonKur: Array(12).fill(null), kur: Array(12).fill(null) }
    }
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[sheetName], { header: 1 })
    return aoaToMonthlyData(rows)
  }

  const targetBebanYTD = parseMonthlySheet(SHEET_NAMES.targetBebanYTD)
  const targetPremiYTD = parseMonthlySheet(SHEET_NAMES.targetPremiYTD)
  const realisasiBeban = parseMonthlySheet(SHEET_NAMES.realisasiBeban)
  const realisasiPremi = parseMonthlySheet(SHEET_NAMES.realisasiPremi)
  const realisasiBebanTahunLalu = parseMonthlySheet(SHEET_NAMES.bebanTahunLalu)

  // Parse Proyeksi
  let proyeksi = {
    bulanIndex: new Date().getMonth(),
    nonKur: { realParuh1: 0, potensiParuh2: 0 },
    kur: { realParuh1: 0, potensiParuh2: 0 },
  }
  if (wb.SheetNames.includes(SHEET_NAMES.proyeksi)) {
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[SHEET_NAMES.proyeksi], { header: 1 })
    proyeksi = {
      bulanIndex: Number(rows[1]?.[2]) || 0,
      nonKur: {
        realParuh1: Number(rows[4]?.[1]) || 0,
        potensiParuh2: Number(rows[4]?.[2]) || 0,
      },
      kur: {
        realParuh1: Number(rows[5]?.[1]) || 0,
        potensiParuh2: Number(rows[5]?.[2]) || 0,
      },
    }
  }

  return {
    versi: String(profilSheet[11]?.[1] ?? '1.0'),
    tanggalEkspor: String(profilSheet[12]?.[1] ?? new Date().toISOString()),
    profil,
    rkap,
    targetBebanYTD,
    targetPremiYTD,
    realisasiBeban,
    realisasiPremi,
    realisasiBebanTahunLalu,
    proyeksi,
  }
}
