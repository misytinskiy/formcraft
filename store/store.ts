import { create } from "zustand";

interface CommandDialogStand {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCommandDialogStore = create<CommandDialogStand>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
