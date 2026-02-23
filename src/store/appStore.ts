import { create } from 'zustand';

export type TabAktif = 'dasbor' | 'input' | 'simulasi' | 'data';

export interface AppState {
  tabAktif: TabAktif;
  bulanAktif: number;
  setTabAktif: (tab: TabAktif) => void;
  setBulanAktif: (bulan: number) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  tabAktif: 'dasbor',
  bulanAktif: Math.max(0, new Date().getMonth() - 1),
  setTabAktif: (tab) => set({ tabAktif: tab }),
  setBulanAktif: (bulan) => set({ bulanAktif: bulan }),
}));
