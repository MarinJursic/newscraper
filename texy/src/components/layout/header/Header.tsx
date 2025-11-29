"use client"

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Bell, Settings, User, Home, Inbox, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Map paths to icons and display names
const pathConfig: Record<string, { icon: typeof Home; label: string }> = {
    "/": { icon: Home, label: "Home" },
    "/explore": { icon: Search, label: "Explore" },
    "/inbox": { icon: Inbox, label: "Inbox" },
    "/calendar": { icon: Calendar, label: "Calendar" },
}

// Mock notifications data
const notifications = [
    { id: 1, title: "New article published", time: "5 min ago", read: false },
    { id: 2, title: "System update available", time: "1 hour ago", read: false },
    { id: 3, title: "Weekly digest ready", time: "2 hours ago", read: true },
]

export function DashboardHeader() {
    const { state } = useSidebar()
    const pathname = usePathname()

    // Get current page config
    const currentPage = pathConfig[pathname] || { icon: Home, label: "Dashboard" }
    const PageIcon = currentPage.icon
    const unreadCount = notifications.filter(n => !n.read).length

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
                {/* Left side - Sidebar trigger and page title */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                        <PageIcon className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold capitalize">{currentPage.label}</h1>
                    </div>
                </div>

                {/* Right side - Actions and user menu */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {unreadCount} unread
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg border ${!notification.read
                                                    ? "bg-primary/5 border-primary/20"
                                                    : "bg-muted/50"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Settings */}
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/settings">
                            <Settings className="h-5 w-5" />
                        </a>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="" alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">User Name</p>
                                    <p className="text-xs text-muted-foreground">user@example.com</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}