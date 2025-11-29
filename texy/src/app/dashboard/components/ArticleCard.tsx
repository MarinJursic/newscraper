import React from 'react';
import { DisplayArticle } from '@/types/articles';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
    article: DisplayArticle;
    idx: number;
    animate?: boolean;
}

const ArticleCard = ({ article, idx, animate = true }: ArticleCardProps) => {
    const router = useRouter();

    return (
        <div
            key={article.id}
            onClick={() => router.push(`/dashboard/article/${article.id}`)}
            className={cn(
                "cursor-pointer group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 hover:border-violet-200 flex flex-col h-full",
                animate && "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={animate ? { animationDelay: `${idx * 50}ms` } : undefined}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {article.source}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">
                        {article.time}
                    </span>
                    {article.actionable && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-violet-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Actionable
                            </span>
                        </>
                    )}
                </div>
                <div
                    className={`w-1.5 h-1.5 rounded-full ${article.sentiment === 'critical' ? 'bg-red-500' :
                        article.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                ></div>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-violet-600 transition-colors">
                {article.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                {article.summary}
            </p>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                    {article.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 px-2 py-0.5">
                            +{article.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${article.category === 'Security' ? 'text-red-700 bg-red-50' :
                        article.category === 'AI' ? 'text-emerald-700 bg-emerald-50' :
                            article.category === 'Legal' ? 'text-blue-700 bg-blue-50' :
                                'text-slate-700 bg-slate-100'
                        }`}>
                        {article.category}
                    </span>
                    {/* Trend Direction Indicator */}
                    {article.trendDirection && article.trendDirection !== 'stable' && (
                        <span className={`text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded ${
                            article.trendDirection === 'rising' || article.trendDirection === 'surging' 
                                ? 'text-emerald-600 bg-emerald-50' 
                                : 'text-red-600 bg-red-50'
                        }`}>
                            {article.trendDirection === 'rising' || article.trendDirection === 'surging' ? (
                                <ArrowUpRight className="w-3 h-3" />
                            ) : (
                                <ArrowDownRight className="w-3 h-3" />
                            )}
                            {article.changePercent ? `${Math.abs(article.changePercent).toFixed(0)}%` : ''}
                        </span>
                    )}
                    {article.trendScore && article.trendScore > 40 && (
                        <span className="text-[10px] text-violet-600 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {article.trendScore}
                        </span>
                    )}
                </div>
                <button className="text-slate-400 hover:text-violet-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ArticleCard;