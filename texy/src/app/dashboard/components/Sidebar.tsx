"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Globe, Hash, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    const isActive = (path: string) => {
        if (path === "/dashboard") {
            return pathname === "/dashboard" || pathname?.startsWith("/dashboard/[");
        }
        return pathname === path;
    };

    return (
        <>
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 h-screen lg:w-auto bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col justify-between p-5`}
            >
                <div className="space-y-6">
                    {/* Header & Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif tracking-tight">
                            Blinkfeed.
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                        <Link
                            href="/dashboard"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                isActive("/dashboard")
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"
                            }`}
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </Link>
                        <Link
                            href="/dashboard/explore"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                isActive("/dashboard/explore")
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"
                            }`}
                        >
                            <Hash className="w-5 h-5" />
                            Explore
                        </Link>
                        <Link
                            href="/dashboard/world-map"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                isActive("/dashboard/world-map")
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"
                            }`}
                        >
                            <Globe className="w-5 h-5" />
                            World Map
                        </Link>
                    </nav>
                </div>

                {/* Footer */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                        <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                            {user ? getInitials(user.email) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                                {user?.email || 'User'}
                            </div>
                            <div className="text-xs text-slate-500 truncate capitalize">
                                {user?.role || 'Developer'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
