import { AppSidebar } from "@/components/layout/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/header/Header";

export default function ExplorePage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <DashboardHeader />
            <main className="w-full">
                <div className="p-8 pt-24">
                    <h1 className="text-3xl font-bold">Explore</h1>
                    <p className="mt-4 text-muted-foreground">
                        Welcome to the explore page!
                    </p>
                </div>
            </main>
        </SidebarProvider>
    )
}