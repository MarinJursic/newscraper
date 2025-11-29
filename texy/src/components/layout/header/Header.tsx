"use client"

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"

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

export function DashboardHeader() {
    const { state } = useSidebar()
    const [activeTag, setActiveTag] = useState("All")
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

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

    return (
        <header
            className="fixed top-0 right-0 xl:right-[400px] z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-linear"
            style={{
                left: state === "expanded" ? "var(--sidebar-width)" : 0
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