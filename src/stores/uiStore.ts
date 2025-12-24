import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  // Hydration state: prevents SSR/client mismatch for session-dependent UI
  isHydrated: boolean;
  setHydrated: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      // Hydration starts as false, set to true after client mount
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "ui-storage",
      // Don't persist isHydrated - it should always start false on page load
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
