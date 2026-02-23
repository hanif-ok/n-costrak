import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import type { DataRKAP, DataBulanan } from '../engine/types'

export interface ExportData {
  versi: string
  tanggalEkspor: string
  profil: { nama: string; wilayah: string; tahunBerjalan: number; tahunSebelumnya: number }
  rkap: DataRKAP
  targetBebanYTD: { nonKur: DataBulanan; kur: DataBulanan }
  targetPremiYTD: { nonKur: DataBulanan; kur: DataBulanan }
  realisasiBeban: { nonKur: DataBulanan; kur: DataBulanan }
  realisasiPremi: { nonKur: DataBulanan; kur: DataBulanan }
  realisasiBebanTahunLalu: { nonKur: DataBulanan; kur: DataBulanan }
  proyeksi: {
    bulanIndex: number
    nonKur: { realParuh1: number; potensiParuh2: number }
    kur: { realParuh1: number; potensiParuh2: number }
  }
}

export function buildExportData(): ExportData {
  const profilState = useProfilStore.getState()
  const inputState = useInputStore.getState()
  const rkap = getRKAPAktif(profilState)

  return {
    versi: '1.0',
    tanggalEkspor: new Date().toISOString(),
    profil: profilState.profil,
    rkap,
    targetBebanYTD: profilState.targetBebanYTD,
    targetPremiYTD: profilState.targetPremiYTD,
    realisasiBeban: inputState.realisasiBeban,
    realisasiPremi: inputState.realisasiPremi,
    realisasiBebanTahunLalu: inputState.realisasiBebanTahunLalu,
    proyeksi: inputState.proyeksi,
  }
}

export function applyImportData(data: ExportData): void {
  const profilStore = useProfilStore.getState()
  const inputStore = useInputStore.getState()

  if (data.profil) profilStore.setProfil(data.profil)
  if (data.rkap) {
    // Import into the currently active RKAP version
    const versi = profilStore.rkapRevisi.aktif
    profilStore.setRKAP(versi, 'nonKur', data.rkap.nonKur ?? 0)
    profilStore.setRKAP(versi, 'kur', data.rkap.kur ?? 0)
  }
  if (data.targetBebanYTD) {
    data.targetBebanYTD.nonKur?.forEach((v: number | null, i: number) => profilStore.setTargetBebanYTD('nonKur', i, v))
    data.targetBebanYTD.kur?.forEach((v: number | null, i: number) => profilStore.setTargetBebanYTD('kur', i, v))
  }
  if (data.targetPremiYTD) {
    data.targetPremiYTD.nonKur?.forEach((v: number | null, i: number) => profilStore.setTargetPremiYTD('nonKur', i, v))
    data.targetPremiYTD.kur?.forEach((v: number | null, i: number) => profilStore.setTargetPremiYTD('kur', i, v))
  }
  if (data.realisasiBeban) {
    data.realisasiBeban.nonKur?.forEach((v: number | null, i: number) => inputStore.setRealisasiBeban('nonKur', i, v))
    data.realisasiBeban.kur?.forEach((v: number | null, i: number) => inputStore.setRealisasiBeban('kur', i, v))
  }
  if (data.realisasiPremi) {
    data.realisasiPremi.nonKur?.forEach((v: number | null, i: number) => inputStore.setRealisasiPremi('nonKur', i, v))
    data.realisasiPremi.kur?.forEach((v: number | null, i: number) => inputStore.setRealisasiPremi('kur', i, v))
  }
  if (data.realisasiBebanTahunLalu) {
    data.realisasiBebanTahunLalu.nonKur?.forEach((v: number | null, i: number) => inputStore.setRealisasiBebanTahunLalu('nonKur', i, v))
    data.realisasiBebanTahunLalu.kur?.forEach((v: number | null, i: number) => inputStore.setRealisasiBebanTahunLalu('kur', i, v))
  }
}

export function generateFilename(ext: 'json' | 'xlsx'): string {
  const profilState = useProfilStore.getState()
  const namaCabang = profilState.profil.nama.replace(/[^a-zA-Z0-9]/g, '_') || 'cabang'
  const tahun = profilState.profil.tahunBerjalan
  const tanggal = new Date().toISOString().split('T')[0]
  return `beban_pemasaran_${namaCabang}_${tahun}_${tanggal}.${ext}`
}
