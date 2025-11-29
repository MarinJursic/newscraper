// app/dashboard/layout.tsx
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="w-screen h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900 lg:grid lg:grid-cols-[260px_1fr]">
                <Sidebar />
                <main className="h-screen overflow-y-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}