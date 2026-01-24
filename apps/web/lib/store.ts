// Zustand store for Kissa app state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GrinderState {
  currentSetting: number;
  grinderModel: string;
}

interface SettingsState {
  defaultServings: number;
  gramsPerServing: number;
}

interface AppState {
  // Grinder
  grinder: GrinderState;
  setGrinder: (grinder: Partial<GrinderState>) => void;
  applyGrinderSetting: (setting: number) => void;

  // Settings
  settings: SettingsState;
  setSettings: (settings: Partial<SettingsState>) => void;

  // Selected method
  selectedMethodId: string | null;
  setSelectedMethodId: (id: string | null) => void;

  // Optimistic brew data
  pendingBrews: Array<{
    id: string;
    bagId: string;
    methodId: string;
    createdAt: Date;
    synced: boolean;
  }>;
  addPendingBrew: (brew: { id: string; bagId: string; methodId: string }) => void;
  markBrewSynced: (id: string) => void;
  removePendingBrew: (id: string) => void;

  // Online status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Grinder
      grinder: {
        currentSetting: 20,
        grinderModel: 'Comandante C40',
      },
      setGrinder: (grinder) =>
        set((state) => ({
          grinder: { ...state.grinder, ...grinder },
        })),
      applyGrinderSetting: (setting) =>
        set((state) => ({
          grinder: { ...state.grinder, currentSetting: setting },
        })),

      // Settings
      settings: {
        defaultServings: 2,
        gramsPerServing: 15,
      },
      setSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Selected method
      selectedMethodId: null,
      setSelectedMethodId: (id) => set({ selectedMethodId: id }),

      // Pending brews
      pendingBrews: [],
      addPendingBrew: (brew) =>
        set((state) => ({
          pendingBrews: [
            ...state.pendingBrews,
            { ...brew, createdAt: new Date(), synced: false },
          ],
        })),
      markBrewSynced: (id) =>
        set((state) => ({
          pendingBrews: state.pendingBrews.map((b) =>
            b.id === id ? { ...b, synced: true } : b
          ),
        })),
      removePendingBrew: (id) =>
        set((state) => ({
          pendingBrews: state.pendingBrews.filter((b) => b.id !== id),
        })),

      // Online status
      isOnline: true,
      setIsOnline: (online) => set({ isOnline: online }),
    }),
    {
      name: 'kissa-store',
      partialize: (state) => ({
        grinder: state.grinder,
        settings: state.settings,
        selectedMethodId: state.selectedMethodId,
        pendingBrews: state.pendingBrews,
      }),
    }
  )
);
