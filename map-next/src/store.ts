import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { EntryType } from "./types";

interface StoreState {
  type: EntryType | null;
  id: number | null;
  profilePageOpen: boolean;
  showProfilePage: (type: EntryType, id: number) => void;
  toggleProfilePage: () => void;
}

export const useStore = create<StoreState>((set) => ({
  type: null,
  id: null,
  profilePageOpen: false,
  showProfilePage: (type, id) => set({ type, id, profilePageOpen: true }),
  toggleProfilePage: () =>
    set((state) => ({
      profilePageOpen: !state.profilePageOpen,
    })),
}));

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Store", useStore);
}
