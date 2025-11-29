import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SidebarStore {
    open: boolean
    openMobile: boolean
    setOpen: (open: boolean | ((state: boolean) => boolean)) => void
    setOpenMobile: (open: boolean | ((state: boolean) => boolean)) => void
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set) => ({
            open: true,
            openMobile: false,
            setOpen: (value) => set((state) => ({
                open: typeof value === 'function' ? value(state.open) : value
            })),
            setOpenMobile: (value) => set((state) => ({
                openMobile: typeof value === 'function' ? value(state.openMobile) : value
            })),
        }),
        {
            name: 'sidebar_state',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
