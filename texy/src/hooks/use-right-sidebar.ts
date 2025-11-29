import { create } from "zustand";

interface RightSidebarState {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
}

export const useRightSidebar = create<RightSidebarState>((set) => ({
    isOpen: true,
    setIsOpen: (open) => set({ isOpen: open }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

