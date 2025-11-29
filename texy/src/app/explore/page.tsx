import { AppSidebar } from "@/components/layout/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/header/Header";
import { SummarizedCard } from "@/components/features/summarized-card/SummarizedCard";

export default function ExplorePage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <DashboardHeader />
            <main className="w-full h-[200vh]">
                <div className="p-8 pt-32 space-y-16">
                    <div className="flex flex-col items-center">
                        <h1
                            className="
                                text-3xl font-medium tracking-tight
                                bg-gradient-to-r from-green-500 to-green-600
                                bg-clip-text text-transparent
                            "
                        >
                            Welcome back, Antonio
                        </h1>
                        <p className="text-muted-foreground mt-2">Here are the things you missed while you were last away</p>
                    </div>
                    <SummarizedCard title="Title" description="Description" />
                </div>
            </main>
        </SidebarProvider>
    )
}