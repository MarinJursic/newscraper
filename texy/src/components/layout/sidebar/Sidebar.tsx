"use client"

import { Calendar, Home, Inbox, Search, X, Bell, Newspaper } from "lucide-react"
import { useState } from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
]

export function AppSidebar() {
    const [showNotification, setShowNotification] = useState(true)

    return (
        <Sidebar collapsible="icon">
            {/* Application Header */}
            <SidebarHeader>
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:hidden">
                        <Newspaper className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-base">Newscraper</span>
                        <span className="text-xs text-muted-foreground">News Aggregator</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Notification Widget - At the bottom, only visible when expanded */}
            <SidebarFooter>
                {showNotification && (
                    <div className="mx-2 mb-2 p-4 bg-primary/10 border border-primary/20 rounded-lg relative group-data-[collapsible=icon]:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => setShowNotification(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-start gap-3 pr-6">
                            <div className="mt-1 p-2 bg-primary/20 rounded-md">
                                <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1">New Updates</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Here are the new updates for newscraper
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}