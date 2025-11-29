import React from 'react';
import { DisplayArticle } from '@/types/articles';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const ArticleCard = ({ article, idx }: { article: DisplayArticle; idx: number }) => {
    const router = useRouter();

    return (
        <div
            key={article.id}
            onClick={() => router.push(`/dashboard/article/${article.id}`)}
            className="cursor-pointer group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 hover:border-violet-200 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 50}ms` }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {article.source}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">
                        {article.time}
                    </span>
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${article.category === 'Security' ? 'text-red-700 bg-red-50' :
                    article.category === 'AI' ? 'text-emerald-700 bg-emerald-50' :
                        article.category === 'Legal' ? 'text-blue-700 bg-blue-50' :
                            'text-slate-700 bg-slate-100'
                    }`}>
                    {article.category}
                </span>
                <button className="text-slate-400 hover:text-violet-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ArticleCard;