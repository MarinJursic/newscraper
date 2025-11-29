"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, Bookmark, History, Settings, Search } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard' || pathname?.startsWith('/dashboard/[');
        }
        return pathname === path;
    };

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen lg:w-auto bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col justify-between p-5`}>
                <div className="space-y-6">
                    {/* Header & Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif tracking-tight">Blinkfeed.</span>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                        <Link
                            href="/dashboard"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard')
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </Link>
                        <Link
                            href="/dashboard/explore"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/explore')
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Globe className="w-5 h-5" />
                            Explore
                        </Link>
                        <Link
                            href="/dashboard/saved"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/saved')
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Bookmark className="w-5 h-5" />
                            Saved
                        </Link>
                        <Link
                            href="/dashboard/world-map"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/saved')
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Globe className="w-5 h-5" />
                            World Map
                        </Link>
                    </nav>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                    <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">John Doe</div>
                        <div className="text-xs text-slate-500 truncate">Pro Plan</div>
                    </div>
                    <button className="cursor-pointer text-slate-400 hover:text-slate-600">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
