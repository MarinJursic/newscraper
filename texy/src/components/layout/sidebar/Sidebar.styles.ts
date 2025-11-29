import { cn } from "@/lib/utils"

export const style = {
    sidebarHeaderClasses: cn(
        "flex items-center gap-3 px-2 py-2"
    ),
    sidebarNotificationClasses: cn(
        "mx-2 mb-2 p-4 bg-primary/10 border border-primary/20 rounded-lg relative group-data-[collapsible=icon]:hidden"
    )
}