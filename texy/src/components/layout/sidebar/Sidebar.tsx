// AppSidebar.tsx
"use client"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from "@/components/ui/sidebar"

import { Header } from "./components/SidebarHeader"
import { SidebarMenuList } from "./components/MenuList"
import { SidebarNotification } from "./components/Updates"

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader />

            <SidebarContent>
                <SidebarMenuList />
            </SidebarContent>

            <SidebarFooter>
                <SidebarNotification />
            </SidebarFooter>
        </Sidebar>
    )
}
