// components/SidebarAppHeader.tsx
"use client"

import { Newspaper } from "lucide-react"
import { style } from "../Sidebar.styles"

export function Header() {
    return (
        <div className={style.sidebarHeaderClasses}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:hidden">
                <Newspaper className="h-5 w-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-base">Newscraper</span>
                <span className="text-xs text-muted-foreground">News Aggregator</span>
            </div>
        </div>
    )
}
