import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataBulanan } from '@/engine/types';
import { emptyDataBulanan } from '@/engine/types';

export interface InputState {
  realisasiBeban: { nonKur: DataBulanan; kur: DataBulanan };
  realisasiPremi: { nonKur: DataBulanan; kur: DataBulanan };
  realisasiBebanTahunLalu: { nonKur: DataBulanan; kur: DataBulanan };
  proyeksi: {
    bulanIndex: number;
    nonKur: { realParuh1: number; potensiParuh2: number };
    kur: { realParuh1: number; potensiParuh2: number };
  };
  setRealisasiBeban: (segmen: 'nonKur' | 'kur', bulan: number, nilai: number | null) => void;
  setRealisasiPremi: (segmen: 'nonKur' | 'kur', bulan: number, nilai: number | null) => void;
  setRealisasiBebanTahunLalu: (segmen: 'nonKur' | 'kur', bulan: number, nilai: number | null) => void;
  setProyeksi: (segmen: 'nonKur' | 'kur', field: 'realParuh1' | 'potensiParuh2', nilai: number) => void;
  setProyeksiBulan: (bulanIndex: number) => void;
  resetSemua: () => void;
}

export const useInputStore = create<InputState>()(
  persist(
    (set) => ({
      realisasiBeban: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
      realisasiPremi: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
      realisasiBebanTahunLalu: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
      proyeksi: {
        bulanIndex: new Date().getMonth(),
        nonKur: { realParuh1: 0, potensiParuh2: 0 },
        kur: { realParuh1: 0, potensiParuh2: 0 },
      },

      setRealisasiBeban: (segmen, bulan, nilai) =>
        set((state) => {
          const arr = [...state.realisasiBeban[segmen]];
          arr[bulan] = nilai;
          return {
            realisasiBeban: { ...state.realisasiBeban, [segmen]: arr },
          };
        }),

      setRealisasiPremi: (segmen, bulan, nilai) =>
        set((state) => {
          const arr = [...state.realisasiPremi[segmen]];
          arr[bulan] = nilai;
          return {
            realisasiPremi: { ...state.realisasiPremi, [segmen]: arr },
          };
        }),

      setRealisasiBebanTahunLalu: (segmen, bulan, nilai) =>
        set((state) => {
          const arr = [...state.realisasiBebanTahunLalu[segmen]];
          arr[bulan] = nilai;
          return {
            realisasiBebanTahunLalu: { ...state.realisasiBebanTahunLalu, [segmen]: arr },
          };
        }),

      setProyeksi: (segmen, field, nilai) =>
        set((state) => ({
          proyeksi: {
            ...state.proyeksi,
            [segmen]: { ...state.proyeksi[segmen], [field]: nilai },
          },
        })),

      setProyeksiBulan: (bulanIndex) =>
        set((state) => ({
          proyeksi: { ...state.proyeksi, bulanIndex },
        })),

      resetSemua: () =>
        set({
          realisasiBeban: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
          realisasiPremi: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
          realisasiBebanTahunLalu: { nonKur: emptyDataBulanan(), kur: emptyDataBulanan() },
          proyeksi: {
            bulanIndex: new Date().getMonth(),
            nonKur: { realParuh1: 0, potensiParuh2: 0 },
            kur: { realParuh1: 0, potensiParuh2: 0 },
          },
        }),
    }),
    {
      name: 'input-store',
      version: 1,
    }
  )
);
