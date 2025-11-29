// components/SidebarNotification.tsx
"use client"

import { useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { style } from "../Sidebar.styles"

export function SidebarNotification() {
    const [show, setShow] = useState(true)

    if (!show) return null

    return (
        <div className={style.sidebarNotificationClasses}>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => setShow(false)}
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
    )
}
