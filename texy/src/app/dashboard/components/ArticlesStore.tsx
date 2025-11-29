import { Calendar, Filter, Search } from 'lucide-react';
import React from 'react';
import ArticleCard from './ArticleCard';
import { DisplayArticle } from '@/types/articles';

export default function ArticlesStore({ articles, title, loading, searchQuery, setSearchQuery }: { articles: DisplayArticle[]; title: string; loading: boolean; searchQuery: string; setSearchQuery: (query: string) => void }) {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 w-full sm:w-48 transition-all"
                        />
                    </div>
                    <button className="cursor-pointer p-1.5 text-slate-500 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="cursor-pointer p-1.5 text-slate-500 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, idx) => (
                        <ArticleCard key={article.id} article={article} idx={idx} />
                    ))}
                </div>
            )}

            {!loading && articles.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No articles found matching {searchQuery ? `"${searchQuery}"` : 'your search'}</p>
                </div>
            )}
        </div>
    )
}