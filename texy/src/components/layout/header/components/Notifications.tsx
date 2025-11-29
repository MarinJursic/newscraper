"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const notifications = [
    { id: 1, title: "New article published", time: "5 min ago", read: false },
    { id: 2, title: "System update available", time: "1 hour ago", read: false },
    { id: 3, title: "Weekly digest ready", time: "2 hours ago", read: true },
]

export function Notifications() {
    const unreadCount = notifications.filter(n => !n.read).length

    return (
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
    )
}
