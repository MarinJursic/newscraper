import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, Bookmark, History, Settings, Search } from 'lucide-react';

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard' || pathname?.startsWith('/dashboard/[');
        }
        return pathname === path;
    };

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen lg:w-auto bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col justify-between p-5 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="space-y-6">
                    {/* Header & Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif tracking-tight">Texy.</span>
                    </div>

                    {/* Search Module */}
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search topics, sources..."
                            className="w-full pl-9 pr-10 py-2.5 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white rounded border border-gray-200 text-[10px] font-medium text-slate-400 shadow-sm">
                            ⌘K
                        </div>
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
                            href="/explore"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/explore')
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Globe className="w-5 h-5" />
                            Explore
                        </Link>
                        <Link
                            href="/saved"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/saved')
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <Bookmark className="w-5 h-5" />
                            Saved
                        </Link>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-gray-50 hover:text-slate-900 font-medium transition-colors">
                            <History className="w-5 h-5" />
                            History
                        </button>
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
                    <button className="text-slate-400 hover:text-slate-600">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
