"use client"

import { useState } from 'react';
import { Menu } from 'lucide-react';
import HeroSection from './components/HeroSection';
import TrendingWidget from './components/TrendingWidget';
import { useFilteredArticles } from '../../hooks/useArticles';
import ArticlesStore from './components/ArticlesStore';

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
    const [searchQuery, setSearchQuery] = useState('');

    const { articles, categories, trendingKeywords, loading, error } = useFilteredArticles(
        activeCategory,
        searchQuery
    );

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="flex flex-col h-screen overflow-y-auto relative no-scrollbar bg-white">
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade w-full">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeCategory === cat
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <HeroSection activeCategory={activeCategory} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <ArticlesStore articles={articles} title="Latest Intelligence" loading={loading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                    <div className="lg:col-span-1 space-y-6">
                        <TrendingWidget keywords={TRENDING_KEYWORDS} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;

