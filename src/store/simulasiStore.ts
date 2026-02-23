import { create } from 'zustand';

export interface SimulasiState {
  aktif: boolean;
  overrideBeban: { nonKur: number | null; kur: number | null };
  overridePremi: { nonKur: number | null; kur: number | null };
  bulanSimulasi: number;
  setAktif: (aktif: boolean) => void;
  setOverrideBeban: (segmen: 'nonKur' | 'kur', nilai: number | null) => void;
  setOverridePremi: (segmen: 'nonKur' | 'kur', nilai: number | null) => void;
  setBulanSimulasi: (bulan: number) => void;
  resetSimulasi: () => void;
}

export const useSimulasiStore = create<SimulasiState>()((set) => ({
  aktif: false,
  overrideBeban: { nonKur: null, kur: null },
  overridePremi: { nonKur: null, kur: null },
  bulanSimulasi: new Date().getMonth(),

  setAktif: (aktif) => set({ aktif }),

  setOverrideBeban: (segmen, nilai) =>
    set((state) => ({
      overrideBeban: { ...state.overrideBeban, [segmen]: nilai },
    })),

  setOverridePremi: (segmen, nilai) =>
    set((state) => ({
      overridePremi: { ...state.overridePremi, [segmen]: nilai },
    })),

  setBulanSimulasi: (bulan) => set({ bulanSimulasi: bulan }),

  resetSimulasi: () =>
    set({
      aktif: false,
      overrideBeban: { nonKur: null, kur: null },
      overridePremi: { nonKur: null, kur: null },
    }),
}));
