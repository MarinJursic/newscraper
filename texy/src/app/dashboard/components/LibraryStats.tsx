import React from 'react';
import { BookOpen, Clock } from 'lucide-react';

interface LibraryStatsProps {
    unreadCount: number;
    estimatedTime: number;
}

const LibraryStats: React.FC<LibraryStatsProps> = ({ unreadCount, estimatedTime }) => {
    return (
        <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                            <BookOpen className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Your Library</h2>
                            <p className="text-sm text-slate-500">Personal knowledge base</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{unreadCount}</div>
                            <div className="text-sm text-slate-500">Unread articles</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div>
                                <div className="text-lg font-bold text-slate-900">{estimatedTime} mins</div>
                                <div className="text-xs text-slate-500">Estimated reading time</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <div className="w-32 h-32 bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-violet-300" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryStats;
