import { create } from "zustand";

export type AutoArrangeFailure = { subjectCode: string; reason: string };
export type AutoArrangeStats = { successfullyPlaced: number; failed: number };

type State = {
  failures: AutoArrangeFailure[];
  stats: AutoArrangeStats | null;
  setResult: (r: { failures: AutoArrangeFailure[]; stats: AutoArrangeStats | null }) => void;
  clear: () => void;
};

export const useAutoArrangeResult = create<State>((set) => ({
  failures: [],
  stats: null,
  setResult: ({ failures, stats }) => set({ failures, stats }),
  clear: () => set({ failures: [], stats: null }),
}));
