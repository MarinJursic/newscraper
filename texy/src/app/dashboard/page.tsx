"use client"

import React, { useState } from 'react';
import { Search, Menu, ChevronRight, Filter, Calendar } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import TrendingWidget from './components/TrendingWidget';
import { AppSidebar } from '@/components/layout/sidebar/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

type Category = 'All' | 'Python' | 'Security' | 'AI' | 'Startups' | 'Crypto';

interface Article {
    id: string;
    category: Category;
    source: string;
    time: string;
    title: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'critical';
    image?: string;
}

const ARTICLES: Article[] = [
    {
        id: '1',
        category: 'Python',
        source: 'Real Python',
        time: '2h ago',
        title: 'Python 3.13: The GIL is Finally Optional',
        summary: 'A deep dive into the experimental no-GIL build in Python 3.13 and what it means for multi-threaded performance.',
        sentiment: 'positive',
    },
    {
        id: '2',
        category: 'Security',
        source: 'The Hacker News',
        time: '4h ago',
        title: 'Critical RCE Vulnerability in Jenkins',
        summary: 'CVE-2024-2389 allows unauthenticated attackers to execute arbitrary code. Patch immediately.',
        sentiment: 'critical',
    },
    {
        id: '3',
        category: 'AI',
        source: 'OpenAI Blog',
        time: '5h ago',
        title: 'Sora: Creating Video from Text',
        summary: 'OpenAI introduces Sora, a text-to-video model capable of generating highly detailed scenes up to a minute long.',
        sentiment: 'positive',
    },
    {
        id: '4',
        category: 'Startups',
        source: 'TechCrunch',
        time: '6h ago',
        title: 'Y Combinator W24 Batch Analysis',
        summary: 'Trends from the latest batch show a massive pivot towards B2B AI agents and dev tools.',
        sentiment: 'neutral',
    },
    {
        id: '5',
        category: 'Crypto',
        source: 'CoinDesk',
        time: '7h ago',
        title: 'Bitcoin Halving: 30 Days to Go',
        summary: 'Miners are upgrading hardware in anticipation of reduced rewards. Market volatility expected.',
        sentiment: 'neutral',
    },
    {
        id: '6',
        category: 'Python',
        source: 'Django News',
        time: '8h ago',
        title: 'Django 5.0 Released',
        summary: 'Features include database-computed default values and simplified form rendering.',
        sentiment: 'positive',
    },
    {
        id: '7',
        category: 'Security',
        source: 'Krebs on Security',
        time: '10h ago',
        title: 'New Phishing Campaign Targets GitHub Users',
        summary: 'Attackers are using fake CI/CD notifications to steal credentials.',
        sentiment: 'critical',
    },
    {
        id: '8',
        category: 'AI',
        source: 'Hugging Face',
        time: '12h ago',
        title: 'Mistral Large Released',
        summary: 'New flagship model rivals GPT-4 in reasoning capabilities and is available on Azure.',
        sentiment: 'positive',
    },
];

const CATEGORIES: Category[] = ['All', 'Python', 'Security', 'AI', 'Startups', 'Crypto'];

const TRENDING_KEYWORDS = [
    { tag: '#ZeroDay', count: 142 },
    { tag: '#LLM', count: 98 },
    { tag: '#RustLang', count: 85 },
    { tag: '#Kubernetes', count: 76 },
    { tag: '#WebAssembly', count: 64 },
    { tag: '#React19', count: 52 },
];

const Dashboard = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = ARTICLES.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900 flex w-full">
                {/* <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} /> */}
                <AppSidebar />
                <main className="flex flex-col flex-1 h-screen overflow-y-auto relative no-scrollbar bg-white">
                    {/* Header with Sidebar Toggle */}
                    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <span className="text-xl font-bold font-serif">Texy.</span>
                        </div>
                    </div>

                    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                    <HeroSection activeCategory={activeCategory} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-900">Latest Intelligence</h2>
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
                                    <button className="p-1.5 text-slate-500 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-slate-500 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredArticles.map((article, idx) => (
                                    <div
                                        key={article.id}
                                        className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 hover:border-violet-200 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
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
                                                article.category === 'Python' ? 'text-blue-700 bg-blue-50' :
                                                    article.category === 'AI' ? 'text-emerald-700 bg-emerald-50' :
                                                        'text-slate-700 bg-slate-100'
                                                }`}>
                                                {article.category}
                                            </span>
                                            <button className="text-slate-400 hover:text-violet-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredArticles.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No articles found matching "{searchQuery}".</p>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <TrendingWidget keywords={TRENDING_KEYWORDS} />
                        </div>
                    </div>
                </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default Dashboard;
