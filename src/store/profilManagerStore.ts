import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfilCabangSnapshot } from '@/engine/types'
import { useProfilStore } from './profilStore'
import { useInputStore } from './inputStore'

export interface ProfilManagerState {
  daftarProfil: ProfilCabangSnapshot[]
  profilAktifId: string | null
  simpanProfilBaru: (label?: string) => string
  simpanProfilSaatIni: () => void
  muatProfil: (id: string) => void
  hapusProfil: (id: string) => void
  renameProfil: (id: string, label: string) => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
}

function captureCurrentData(): Omit<ProfilCabangSnapshot, 'id' | 'label' | 'createdAt' | 'updatedAt'> {
  const profilState = useProfilStore.getState()
  const inputState = useInputStore.getState()
  return {
    profil: { ...profilState.profil },
    rkapRevisi: JSON.parse(JSON.stringify(profilState.rkapRevisi)),
    targetBebanYTD: JSON.parse(JSON.stringify(profilState.targetBebanYTD)),
    targetPremiYTD: JSON.parse(JSON.stringify(profilState.targetPremiYTD)),
    realisasiBeban: JSON.parse(JSON.stringify(inputState.realisasiBeban)),
    realisasiPremi: JSON.parse(JSON.stringify(inputState.realisasiPremi)),
    realisasiBebanTahunLalu: JSON.parse(JSON.stringify(inputState.realisasiBebanTahunLalu)),
    proyeksi: JSON.parse(JSON.stringify(inputState.proyeksi)),
  }
}

function applySnapshot(snapshot: ProfilCabangSnapshot): void {
  const profilStore = useProfilStore.getState()
  const inputStore = useInputStore.getState()

  // Reset first, then apply
  profilStore.resetSemua()
  inputStore.resetSemua()

  profilStore.setProfil(snapshot.profil)

  // Apply rkapRevisi directly via store's internal state
  useProfilStore.setState({ rkapRevisi: JSON.parse(JSON.stringify(snapshot.rkapRevisi)) })

  // Apply targets
  snapshot.targetBebanYTD.nonKur.forEach((v, i) => profilStore.setTargetBebanYTD('nonKur', i, v))
  snapshot.targetBebanYTD.kur.forEach((v, i) => profilStore.setTargetBebanYTD('kur', i, v))
  snapshot.targetPremiYTD.nonKur.forEach((v, i) => profilStore.setTargetPremiYTD('nonKur', i, v))
  snapshot.targetPremiYTD.kur.forEach((v, i) => profilStore.setTargetPremiYTD('kur', i, v))

  // Apply realisasi
  snapshot.realisasiBeban.nonKur.forEach((v, i) => inputStore.setRealisasiBeban('nonKur', i, v))
  snapshot.realisasiBeban.kur.forEach((v, i) => inputStore.setRealisasiBeban('kur', i, v))
  snapshot.realisasiPremi.nonKur.forEach((v, i) => inputStore.setRealisasiPremi('nonKur', i, v))
  snapshot.realisasiPremi.kur.forEach((v, i) => inputStore.setRealisasiPremi('kur', i, v))
  snapshot.realisasiBebanTahunLalu.nonKur.forEach((v, i) => inputStore.setRealisasiBebanTahunLalu('nonKur', i, v))
  snapshot.realisasiBebanTahunLalu.kur.forEach((v, i) => inputStore.setRealisasiBebanTahunLalu('kur', i, v))

  // Apply proyeksi
  if (snapshot.proyeksi) {
    inputStore.setProyeksiBulan(snapshot.proyeksi.bulanIndex)
    inputStore.setProyeksi('nonKur', 'realParuh1', snapshot.proyeksi.nonKur.realParuh1)
    inputStore.setProyeksi('nonKur', 'potensiParuh2', snapshot.proyeksi.nonKur.potensiParuh2)
    inputStore.setProyeksi('kur', 'realParuh1', snapshot.proyeksi.kur.realParuh1)
    inputStore.setProyeksi('kur', 'potensiParuh2', snapshot.proyeksi.kur.potensiParuh2)
  }
}

export const useProfilManagerStore = create<ProfilManagerState>()(
  persist(
    (set, get) => ({
      daftarProfil: [],
      profilAktifId: null,

      simpanProfilBaru: (label?: string) => {
        const state = get()
        const data = captureCurrentData()
        const now = new Date().toISOString()
        const id = generateId()
        const finalLabel = label || data.profil.nama || `Profil ${state.daftarProfil.length + 1}`

        // Save current active profile first if it exists
        if (state.profilAktifId) {
          const idx = state.daftarProfil.findIndex((p) => p.id === state.profilAktifId)
          if (idx >= 0) {
            const updated = [...state.daftarProfil]
            updated[idx] = { ...updated[idx], ...captureCurrentData(), updatedAt: now }
            set({ daftarProfil: updated })
          }
        }

        const snapshot: ProfilCabangSnapshot = {
          id,
          label: finalLabel,
          createdAt: now,
          updatedAt: now,
          ...data,
        }

        set((s) => ({
          daftarProfil: [...s.daftarProfil, snapshot],
          profilAktifId: id,
        }))

        return id
      },

      simpanProfilSaatIni: () => {
        const state = get()
        if (!state.profilAktifId) return
        const idx = state.daftarProfil.findIndex((p) => p.id === state.profilAktifId)
        if (idx < 0) return

        const data = captureCurrentData()
        const updated = [...state.daftarProfil]
        updated[idx] = { ...updated[idx], ...data, updatedAt: new Date().toISOString() }
        set({ daftarProfil: updated })
      },

      muatProfil: (id: string) => {
        const state = get()
        // Auto-save current profile before switching
        if (state.profilAktifId && state.profilAktifId !== id) {
          const currentIdx = state.daftarProfil.findIndex((p) => p.id === state.profilAktifId)
          if (currentIdx >= 0) {
            const data = captureCurrentData()
            const updated = [...state.daftarProfil]
            updated[currentIdx] = { ...updated[currentIdx], ...data, updatedAt: new Date().toISOString() }
            set({ daftarProfil: updated })
          }
        }

        const snapshot = get().daftarProfil.find((p) => p.id === id)
        if (!snapshot) return

        applySnapshot(snapshot)
        set({ profilAktifId: id })
      },

      hapusProfil: (id: string) => {
        set((s) => {
          const filtered = s.daftarProfil.filter((p) => p.id !== id)
          const newActiveId = s.profilAktifId === id ? null : s.profilAktifId
          return { daftarProfil: filtered, profilAktifId: newActiveId }
        })
      },

      renameProfil: (id: string, label: string) => {
        set((s) => ({
          daftarProfil: s.daftarProfil.map((p) => p.id === id ? { ...p, label } : p),
        }))
      },
    }),
    {
      name: 'profil-manager-store',
      version: 1,
    }
  )
)
