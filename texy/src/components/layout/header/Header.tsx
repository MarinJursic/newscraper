"use client"

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { useRightSidebar } from "@/hooks/use-right-sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

const tags = [
    "All",
    "Python",
    "Security",
    "AI",
    "Startups",
    "Crypto",
    "JavaScript",
    "React",
    "Next.js",
    "Machine Learning",
    "Data Science",
    "Web Development"
]

const XL_BREAKPOINT = 1280

export function DashboardHeader() {
    const { state } = useSidebar()
    const { isOpen: isRightSidebarOpen } = useRightSidebar()
    const [activeTag, setActiveTag] = useState("All")
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [isXlScreen, setIsXlScreen] = useState(false)

    // Track viewport width to apply right sidebar offset only on xl screens
    useEffect(() => {
        const checkScreenSize = () => {
            setIsXlScreen(window.innerWidth >= XL_BREAKPOINT)
        }
        
        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        e.preventDefault()
        const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0)
        const walk = (x - startX) * 2 // Scroll-fast
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk
        }
    }

    // Calculate right position: 400px on xl screens when right sidebar is open, otherwise 0
    const rightPosition = isXlScreen && isRightSidebarOpen ? 400 : 0

    return (
        <header
            className="fixed top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out"
            style={{
                left: state === "expanded"
                    ? "var(--sidebar-width)"
                    : "var(--sidebar-width-icon)",
                right: rightPosition
            }}
        >
            <div className="flex h-full items-center px-4 gap-4">
                <SidebarTrigger />

                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mask-linear-fade cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {tags.map((tag) => (
                        <Button
                            key={tag}
                            variant={activeTag === tag ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                if (!isDragging) setActiveTag(tag)
                            }}
                            className={cn(
                                "rounded-full whitespace-nowrap h-8 text-xs select-none",
                                activeTag === tag
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                        >
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>
        </header>
    )
}