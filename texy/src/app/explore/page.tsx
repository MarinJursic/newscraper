"use client";

import { AppSidebar } from "@/components/layout/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RightSidebarProvider, useRightSidebar } from "@/components/layout/right-sidebar/RightSidebarContext";
import { DashboardHeader } from "@/components/layout/header/Header";
import { SummarizedCard } from "@/components/features/summarized-card/SummarizedCard";
import { ChatbotWidget } from "@/components/features/chatbot-widget/ChatbotWidget";
import { StatsWidget } from "@/components/features/stats-widget/StatsWidget";
import { TrendingTopicsWidget } from "@/components/features/trending-topics-widget/TrendingTopicsWidget";
import { Map as MapIcon, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ExplorePageContent() {
    const { isOpen: isRightSidebarOpen, toggle: toggleRightSidebar } = useRightSidebar();

    return (
        <>
            <AppSidebar />
            <DashboardHeader />
            <main className={cn(
                "flex-1 flex flex-col min-h-screen bg-muted/5 pt-16 transition-[padding] duration-300 ease-in-out",
                isRightSidebarOpen ? "xl:pr-[400px]" : "xl:pr-0"
            )}>
                <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                    {/* Main Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-5xl mx-auto space-y-12">
                            {/* Welcome Section */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <h1
                                    className="
                                        text-4xl font-semibold tracking-tight
                                        bg-gradient-to-r from-green-600 to-emerald-600
                                        bg-clip-text text-transparent
                                    "
                                >
                                    Welcome back, Antonio
                                </h1>
                                <p className="text-muted-foreground text-lg max-w-2xl">
                                    Here's what happened while you were away. We've summarized the key updates for you.
                                </p>
                            </div>

                            {/* Overview Grid */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold tracking-tight px-1">Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Main Summary Card */}
                                    <div className="md:col-span-2">
                                        <SummarizedCard
                                            title="North Korean Hackers Seed Malicious npm Packages"
                                            description="North Korean attackers uploaded 197 malicious npm packages, downloaded over 31k times, to deploy updated OtterCookie malware stealing credentials, crypto wallets, and enabling remote access."
                                        />
                                    </div>

                                    {/* Stats Widget */}
                                    <StatsWidget />

                                    {/* Trending Topics */}
                                    <TrendingTopicsWidget />

                                    {/* Another Summary Card */}
                                    <div className="md:col-span-2">
                                        <SummarizedCard
                                            title="New React 19 Features Announced"
                                            description="The React team has unveiled the latest features coming to React 19, including the new compiler, server actions, and enhanced hook primitives for better performance."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Toggle Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed top-20 right-4 z-50 hidden xl:flex bg-background shadow-md hover:bg-muted"
                    onClick={toggleRightSidebar}
                >
                    {isRightSidebarOpen ? (
                        <PanelRightClose className="h-4 w-4" />
                    ) : (
                        <PanelRightOpen className="h-4 w-4" />
                    )}
                </Button>

                {/* Right Sidebar - Fixed */}
                <div className={cn(
                    "fixed top-0 right-0 bottom-0 w-[400px] hidden xl:flex flex-col gap-4 p-4 border-l bg-background z-40 transition-transform duration-300 ease-in-out",
                    isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
                )}>
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
            </main>
        </>
    );
}

export default function ExplorePage() {
    return (
        <RightSidebarProvider>
            <SidebarProvider>
                <ExplorePageContent />
            </SidebarProvider>
        </RightSidebarProvider>
    );
}