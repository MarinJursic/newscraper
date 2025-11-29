"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const RIGHT_SIDEBAR_WIDTH = "20rem"

type RightSidebarContextProps = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean) => void
    toggleSidebar: () => void
}

const RightSidebarContext = React.createContext<RightSidebarContextProps | null>(null)

function useRightSidebar() {
    const context = React.useContext(RightSidebarContext)
    if (!context) {
        throw new Error("useRightSidebar must be used within a RightSidebarProvider.")
    }
    return context
}

function RightSidebarProvider({
    defaultOpen = false,
    className,
    style,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    defaultOpen?: boolean
}) {
    const [open, setOpen] = React.useState(defaultOpen)

    const toggleSidebar = React.useCallback(() => {
        setOpen((prev) => !prev)
    }, [])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<RightSidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            toggleSidebar,
        }),
        [state, open, toggleSidebar]
    )

    return (
        <RightSidebarContext.Provider value={contextValue}>
            <div
                data-slot="right-sidebar-wrapper"
                style={
                    {
                        "--right-sidebar-width": RIGHT_SIDEBAR_WIDTH,
                        ...style,
                    } as React.CSSProperties
                }
                className={cn("flex min-h-svh w-full", className)}
                {...props}
            >
                {children}
            </div>
        </RightSidebarContext.Provider>
    )
}

function RightSidebar({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    const { state } = useRightSidebar()

    return (
        <div
            className="text-sidebar-foreground hidden md:block"
            data-state={state}
            data-slot="right-sidebar"
        >
            {/* Spacer for the sidebar */}
            <div
                data-slot="right-sidebar-gap"
                className={cn(
                    "relative bg-transparent transition-[width] duration-200 ease-linear",
                    state === "expanded" ? "w-(--right-sidebar-width)" : "w-0"
                )}
            />
            {/* Fixed sidebar container */}
            <div
                data-slot="right-sidebar-container"
                className={cn(
                    "fixed inset-y-0 right-0 z-10 hidden h-svh transition-[width,transform] duration-200 ease-linear md:flex",
                    state === "expanded" ? "w-(--right-sidebar-width)" : "w-0 translate-x-full",
                    "border-l",
                    className
                )}
                {...props}
            >
                <div
                    data-slot="right-sidebar-inner"
                    className="bg-sidebar flex h-full w-full flex-col overflow-hidden"
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

function RightSidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="right-sidebar-header"
            className={cn("flex h-16 items-center px-4 border-b", className)}
            {...props}
        />
    )
}

function RightSidebarContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="right-sidebar-content"
            className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4", className)}
            {...props}
        />
    )
}

function RightSidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="right-sidebar-footer"
            className={cn("flex flex-col gap-2 p-4 border-t", className)}
            {...props}
        />
    )
}

export {
    RightSidebar,
    RightSidebarContent,
    RightSidebarFooter,
    RightSidebarHeader,
    RightSidebarProvider,
    useRightSidebar,
}

