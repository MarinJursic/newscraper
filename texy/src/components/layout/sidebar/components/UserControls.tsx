"use client"

import { Bell, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const notifications = [
    { id: 1, title: "New article published", time: "5 min ago", read: false },
    { id: 2, title: "System update available", time: "1 hour ago", read: false },
    { id: 3, title: "Weekly digest ready", time: "2 hours ago", read: true },
]

export function UserControls() {
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="flex items-center justify-between p-2 mt-2 border-t group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4">
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-8 w-8">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start" side="right">
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
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href="/settings">
                        <Settings className="h-4 w-4" />
                    </a>
                </Button>
            </div>

            {/* User Profile */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-56">
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
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
