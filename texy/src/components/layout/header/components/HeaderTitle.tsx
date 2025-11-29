"use client"

import { usePathname } from "next/navigation"
import { Home, Inbox, Calendar, Search } from "lucide-react"

const pathConfig: Record<string, { icon: typeof Home; label: string }> = {
    "/": { icon: Home, label: "Home" },
    "/explore": { icon: Search, label: "Explore" },
    "/inbox": { icon: Inbox, label: "Inbox" },
    "/calendar": { icon: Calendar, label: "Calendar" },
}

export function HeaderTitle() {
    const pathname = usePathname()
    const currentPage = pathConfig[pathname] || { icon: Home, label: "Dashboard" }
    const PageIcon = currentPage.icon

    return (
        <div className="flex items-center gap-2">
            <PageIcon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold capitalize">{currentPage.label}</h1>
        </div>
    )
}
