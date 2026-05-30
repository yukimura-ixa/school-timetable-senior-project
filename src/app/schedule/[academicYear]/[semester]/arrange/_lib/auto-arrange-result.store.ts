import { create } from "zustand";

export type AutoArrangeFailure = { subjectCode: string; reason: string };

type State = {
  failures: AutoArrangeFailure[];
  setResult: (failures: AutoArrangeFailure[]) => void;
  clear: () => void;
};

export const useAutoArrangeResult = create<State>((set) => ({
  failures: [],
  setResult: (failures) => set({ failures }),
  clear: () => set({ failures: [] }),
}));
