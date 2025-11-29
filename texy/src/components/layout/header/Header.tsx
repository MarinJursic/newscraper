"use client"

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeaderTitle } from "./components/HeaderTitle"
import { Notifications } from "./components/Notifications"
import { UserNav } from "./components/UserNav"

export function DashboardHeader() {
    const { state } = useSidebar()

    return (
        <header
            className="fixed top-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-linear"
            style={{
                left: state === "expanded"
                    ? "var(--sidebar-width)"
                    : "var(--sidebar-width-icon)"
            }}
        >
            <div className="flex h-full items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <HeaderTitle />
                </div>

                <div className="flex items-center gap-2">
                    <Notifications />

                    <Button variant="ghost" size="icon" asChild>
                        <a href="/settings">
                            <Settings className="h-5 w-5" />
                        </a>
                    </Button>

                    <UserNav />
                </div>
            </div>
        </header>
    )
}