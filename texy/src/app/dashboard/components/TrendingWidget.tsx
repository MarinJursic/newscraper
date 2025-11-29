"use client"

import { Activity } from 'lucide-react';

type Keyword = {
    tag: string;
    count: number;
    keyword?: string;
}

const TrendingWidget = ({ keywords, totalArticles }: { keywords: Keyword[], totalArticles: number }) => {

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-600" />
                    <h3 className="font-bold text-slate-900">Trending Now</h3>
                </div>
            </div>

            <div className="space-y-1">
                {keywords.map((item) => (
                    <div key={item.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700 transition-colors">
                            {item.keyword || item.tag.replace('#', '')}
                        </span>
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full group-hover:bg-violet-100 group-hover:shadow-sm transition-all">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">System Status</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        {totalArticles} articles scanned today. AI analysis engine is online.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrendingWidget;
