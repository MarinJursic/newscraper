"use client";

import { useRightSidebar } from "@/hooks/use-right-sidebar";
import { ChatbotWidget } from "@/components/features/chatbot-widget/ChatbotWidget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Map as MapIcon, PanelRightClose, PanelRightOpen } from "lucide-react";

export function RightSidebar() {
    const { isOpen, toggle } = useRightSidebar();

    return (
        <>
            {/* Right Sidebar Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                className="fixed top-20 right-4 z-50 hidden xl:flex bg-background shadow-md hover:bg-muted"
                onClick={toggle}
            >
                {isOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                ) : (
                    <PanelRightOpen className="h-4 w-4" />
                )}
            </Button>

            {/* Right Sidebar - Fixed */}
            <div
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-[400px] hidden xl:flex flex-col gap-4 p-4 border-l bg-background z-40 transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Map Placeholder */}
                <div className="flex-1 rounded-xl bg-muted/50 border flex items-center justify-center relative overflow-hidden group mt-16">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg flex items-center gap-2">
                        <MapIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Global Events Map</span>
                    </div>
                </div>

                {/* Chatbot */}
                <div className="flex-1 min-h-0">
                    <ChatbotWidget />
                </div>
            </div>
        </>
    );
}

