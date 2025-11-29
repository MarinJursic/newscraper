// app/dashboard/layout.tsx
import Sidebar from "./components/Sidebar"; // Prilagodi putanju ovisno gdje ti je Sidebar

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-screen h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900 lg:grid lg:grid-cols-[260px_1fr]">
            {/* Sidebar je sada samo ovdje */}
            <Sidebar />

            {/* Ovo je glavni sadržaj dashboarda koji scrolla */}
            <main className="h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    );
}