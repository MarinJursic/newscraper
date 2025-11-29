"use client";

import { AppSidebar } from "@/components/layout/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/header/Header";
import { RightSidebar } from "@/components/layout/right-sidebar/RightSidebar";
import { SummarizedCard } from "@/components/features/summarized-card/SummarizedCard";
import { StatsWidget } from "@/components/features/stats-widget/StatsWidget";
import { TrendingTopicsWidget } from "@/components/features/trending-topics-widget/TrendingTopicsWidget";
import { useRightSidebar } from "@/hooks/use-right-sidebar";
import { cn } from "@/lib/utils";

function ExplorePageContent() {
    const isRightSidebarOpen = useRightSidebar((state) => state.isOpen);

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

                <RightSidebar />
            </main>
        </>
    );
}

export default function ExplorePage() {
    return (
        <SidebarProvider>
            <ExplorePageContent />
        </SidebarProvider>
    );
}
