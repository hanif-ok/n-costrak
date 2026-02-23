import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfilCabang, DataRKAP, DataRKAPRevisi, DataBulanan } from '@/engine/types';
import { emptyDataBulanan } from '@/engine/types';

export interface ProfilState {
  profil: ProfilCabang;
  rkapRevisi: DataRKAPRevisi;
  targetBebanYTD: { nonKur: DataBulanan; kur: DataBulanan };
  targetPremiYTD: { nonKur: DataBulanan; kur: DataBulanan };
  setProfil: (profil: Partial<ProfilCabang>) => void;
  setRKAP: (versi: 'awal' | 'revisi', segmen: 'nonKur' | 'kur', nilai: number) => void;
  setRKAPAktif: (versi: 'awal' | 'revisi') => void;
  buatRevisiRKAP: () => void;
  hapusRevisiRKAP: () => void;
  setTargetBebanYTD: (segmen: 'nonKur' | 'kur', bulan: number, nilai: number | null) => void;
  setTargetPremiYTD: (segmen: 'nonKur' | 'kur', bulan: number, nilai: number | null) => void;
  resetSemua: () => void;
}

const initialProfil: ProfilCabang = {
  nama: '',
  wilayah: '',
  tahunBerjalan: new Date().getFullYear(),
  tahunSebelumnya: new Date().getFullYear() - 1,
};

const initialRKAP: DataRKAP = { nonKur: 0, kur: 0, gabungan: 0 };

const initialRKAPRevisi: DataRKAPRevisi = {
  awal: { ...initialRKAP },
  revisi: null,
  aktif: 'awal',
};

function recalcGabungan(rkap: DataRKAP): DataRKAP {
  return { ...rkap, gabungan: Math.round((rkap.nonKur + rkap.kur) * 100) / 100 };
}

export function getRKAPAktif(state: ProfilState): DataRKAP {
  const { rkapRevisi } = state;
  if (rkapRevisi.aktif === 'revisi' && rkapRevisi.revisi) {
    return rkapRevisi.revisi;
  }
  return rkapRevisi.awal;
}

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      profil: { ...initialProfil },
      rkapRevisi: { ...initialRKAPRevisi },
      targetBebanYTD: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
      targetPremiYTD: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },

      setProfil: (partial) =>
        set((state) => ({
          profil: { ...state.profil, ...partial },
        })),

      setRKAP: (versi, segmen, nilai) =>
        set((state) => {
          const rev = { ...state.rkapRevisi };
          if (versi === 'awal') {
            const updated = { ...rev.awal, [segmen]: nilai };
            rev.awal = recalcGabungan(updated);
          } else if (rev.revisi) {
            const updated = { ...rev.revisi, [segmen]: nilai };
            rev.revisi = recalcGabungan(updated);
          }
          return { rkapRevisi: rev };
        }),

      setRKAPAktif: (versi) =>
        set((state) => ({
          rkapRevisi: { ...state.rkapRevisi, aktif: versi },
        })),

      buatRevisiRKAP: () =>
        set((state) => ({
          rkapRevisi: {
            ...state.rkapRevisi,
            revisi: { ...state.rkapRevisi.awal },
            aktif: 'revisi',
          },
        })),

      hapusRevisiRKAP: () =>
        set((state) => ({
          rkapRevisi: {
            ...state.rkapRevisi,
            revisi: null,
            aktif: 'awal',
          },
        })),

      setTargetBebanYTD: (segmen, bulan, nilai) =>
        set((state) => {
          const arr = [...state.targetBebanYTD[segmen]];
          arr[bulan] = nilai;
          return {
            targetBebanYTD: { ...state.targetBebanYTD, [segmen]: arr },
          };
        }),

      setTargetPremiYTD: (segmen, bulan, nilai) =>
        set((state) => {
          const arr = [...state.targetPremiYTD[segmen]];
          arr[bulan] = nilai;
          return {
            targetPremiYTD: { ...state.targetPremiYTD, [segmen]: arr },
          };
        }),

      resetSemua: () =>
        set({
          profil: { ...initialProfil },
          rkapRevisi: { ...initialRKAPRevisi },
          targetBebanYTD: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
          targetPremiYTD: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
        }),
    }),
    {
      name: 'profil-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version === 1) {
          // v1 had `rkap: DataRKAP`, wrap it into rkapRevisi
          const old = persisted as { rkap?: DataRKAP; [key: string]: unknown };
          const rkap = old.rkap ?? { ...initialRKAP };
          const { rkap: _, ...rest } = old;
          return {
            ...rest,
            rkapRevisi: {
              awal: rkap,
              revisi: null,
              aktif: 'awal' as const,
            },
          } as ProfilState;
        }
        return persisted as ProfilState;
      },
    }
  )
);
