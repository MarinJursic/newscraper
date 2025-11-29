"use client"

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Bookmark, ExternalLink, Share2, TrendingUp, Clock, Calendar, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GeoImpactWidget from '../../components/GeoImpactWidget';
import KeywordsWidget from '../../components/KeywordsWidget';
import IntelligenceSidebar from '../../components/IntelligenceSidebar';
import NoteInput from '../../components/NoteInput';
import { format } from 'date-fns';
import { useArticles } from '@/hooks/useArticles'; // Import the hook
import { usePathname } from 'next/navigation'; // Import pathname hook
import { Article } from '@/types/articles'; // Ensure you have this type definition

// --- Types ---
interface Highlight {
    id: string;
    text: string;
    note: string;
    color: string;
}

interface SelectionState {
    top: number;
    left: number;
    text: string;
}

// --- Market Widget Component ---
const MarketWidget = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {data.map((stock) => (
                <div key={stock.ticker} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                            <img
                                src={stock.logo_url}
                                alt={stock.ticker}
                                className="w-6 h-6 object-contain"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{stock.ticker}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[100px]">{stock.company_name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-medium text-slate-900">${stock.price.toFixed(2)}</div>
                        <div className={`text-xs font-bold flex items-center justify-end gap-1 ${stock.change_percent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stock.change_percent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(stock.change_percent)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Trends Graph Component ---
const TrendsGraph = ({ data }: { data: any[] }) => {
    // Safety check if data is missing
    if (!data || data.length === 0) return null;

    return (
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Interest over time</h3>
                    <p className="text-sm text-slate-500">Search volume trend (Last 6 Months)</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(str) => {
                                try {
                                    return format(new Date(str), 'MMM d');
                                } catch (e) {
                                    return str;
                                }
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ArticleDetail = () => {
    // 1. Setup Hooks
    const pathname = usePathname();
    const { articlesData } = useArticles(); // Assuming this returns { articles: Article[], ... }

    // 2. State Management
    const [article, setArticle] = useState<Article | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('notes');
    const [editingNote, setEditingNote] = useState('');
    const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const contentRef = useRef<HTMLDivElement>(null);
    const noteInputRef = useRef<HTMLInputElement>(null);

    // 3. Effect: Find the article based on URL ID
    useEffect(() => {
        // Extract ID from pathname (e.g. /dashboard/article/123 -> 123)
        // Adjust logic if your ID contains slashes or is a full URL encoded string
        const articleId = pathname.split('/').pop();

        if (articleId && articlesData?.articles) {
            // Decode URI in case ID has special characters
            const decodedId = decodeURIComponent(articleId);

            // Find the article. Ensure type compatibility (String conversion just to be safe)
            const foundArticle = articlesData.articles.find(a => String(a.id) === decodedId);

            if (foundArticle) {
                setArticle(foundArticle);
            }
        }
    }, [pathname, articlesData]);

    // 4. Text Parsing
    const paragraphs = useMemo(() => {
        if (!article?.content?.long_description) return [];
        return article.content.long_description.split('\n').filter(p => p.trim().length > 0);
    }, [article]);

    // 5. Highlight Logic
    const handleMouseUp = () => {
        const windowSelection = window.getSelection();
        if (!windowSelection || windowSelection.isCollapsed) {
            setSelection(null);
            return;
        }

        const text = windowSelection.toString().trim();
        if (!text) return;

        if (contentRef.current && contentRef.current.contains(windowSelection.anchorNode)) {
            const range = windowSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelection({
                top: rect.top + window.scrollY - 120,
                left: rect.left + (rect.width / 2),
                text: text
            });
        }
    };

    const addHighlight = (noteText: string) => {
        if (!selection) return;
        const newHighlight: Highlight = {
            id: Date.now().toString(),
            text: selection.text,
            note: noteText,
            color: 'yellow'
        };
        setHighlights([...highlights, newHighlight]);
        setSelection(null);
        setEditingNote('');
        setActiveTab('notes');
        window.getSelection()?.removeAllRanges();
    };

    const cancelHighlight = () => {
        setSelection(null);
        setEditingNote('');
        window.getSelection()?.removeAllRanges();
    };

    const deleteHighlight = (id: string) => {
        setHighlights(highlights.filter(h => h.id !== id));
    };

    const updateNote = (id: string, note: string) => {
        setHighlights(highlights.map(h => h.id === id ? { ...h, note } : h));
    };

    React.useEffect(() => {
        if (selection && noteInputRef.current) {
            noteInputRef.current.focus();
        }
    }, [selection]);

    const renderTextWithHighlights = (text: string) => {
        if (highlights.length === 0) return text;
        let result: React.ReactNode[] = [];
        let lastIndex = 0;
        const relevantHighlights = highlights.filter(h => text.includes(h.text));
        if (relevantHighlights.length === 0) return text;
        relevantHighlights.sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text));

        relevantHighlights.forEach((highlight) => {
            const index = text.indexOf(highlight.text, lastIndex);
            if (index !== -1) {
                if (index > lastIndex) {
                    result.push(text.substring(lastIndex, index));
                }
                result.push(
                    <mark key={highlight.id} className="bg-yellow-200 px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors rounded-sm" title={highlight.note}>
                        {highlight.text}
                    </mark>
                );
                lastIndex = index + highlight.text.length;
            }
        });
        if (lastIndex < text.length) {
            result.push(text.substring(lastIndex));
        }
        return result;
    };

    // --- Loading State ---
    if (!article) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-slate-500 animate-pulse">Loading intelligence report...</div>
            </div>
        );
    }

    // Extract Keywords for sidebar safely
    const sidebarKeywords = article.metadata?.keywords?.map(k => k.keyword) || [];

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                {/* --- Main Content Area --- */}
                <div className="flex-1 overflow-y-auto scroll-smooth" onMouseUp={handleMouseUp}>

                    {/* Header */}
                    <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 lg:px-12 py-4">
                        <div className="max-w-3xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                {article.classification && (
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-medium border border-red-100">
                                        {article.classification.category}
                                    </span>
                                )}
                                <span className="text-slate-300">/</span>
                                <span>The Hacker News</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsSaved(!isSaved)} className={`p-2 transition-colors ${isSaved ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                                <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800 transition-all shadow-md">
                                    Read Original <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-12 pb-24">
                        <div className="max-w-3xl mx-auto">

                            {/* Title */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-slate-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-slate-500 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full flex items-center justify-center text-slate-700 font-bold">
                                        {article.author.charAt(0)}
                                    </div>
                                    <span className="font-medium text-slate-900">{article.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{article.content?.reading_time || '4'} min read</span>
                                </div>
                                {article.classification?.tags?.includes("Zero-Day") && (
                                    <div className="flex items-center gap-2 text-red-600 font-bold">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Zero-Day Detected</span>
                                    </div>
                                )}
                            </div>

                            {/* Market Data Widget */}
                            {article.enrichment?.market_data && (
                                <MarketWidget data={article.enrichment.market_data} />
                            )}

                            {/* Main Text (Long Description) */}
                            <div ref={contentRef} className="prose prose-slate prose-lg max-w-none text-slate-800">
                                {/* Lead / Short Desc */}
                                {article.content?.short_description && (
                                    <p className="lead text-xl md:text-2xl text-slate-600 mb-10 font-light leading-relaxed">
                                        {renderTextWithHighlights(article.content.short_description)}
                                    </p>
                                )}

                                {/* Image */}
                                {article.image_url && (
                                    <div className="my-8 rounded-2xl overflow-hidden shadow-md">
                                        <img src={article.image_url} alt="Article cover" className="w-full h-auto object-cover" />
                                    </div>
                                )}

                                {/* Long Description Paragraphs */}
                                {paragraphs.map((para, idx) => (
                                    <p key={idx} className="mb-6 leading-relaxed">
                                        {renderTextWithHighlights(para)}
                                    </p>
                                ))}
                            </div>

                            {/* Google Trends */}
                            {article.visual_data?.trend_graph?.data_points && (
                                <div className="mt-16">
                                    <TrendsGraph
                                        data={article.visual_data.trend_graph.data_points}
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* --- Right Sidebar --- */}
                <aside className="w-[350px] border-l border-gray-200 bg-slate-50/50 flex flex-col h-screen overflow-hidden shadow-inner">
                    {/* Passing geo_impact to widget */}
                    {article.visual_data?.geo_impact && (
                        <GeoImpactWidget locations={article.visual_data.geo_impact} />
                    )}

                    <div className="flex-1 overflow-y-auto">
                        <KeywordsWidget keywords={sidebarKeywords} />
                        <div className="p-4">
                            <IntelligenceSidebar
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                highlights={highlights}
                                updateNote={updateNote}
                                deleteHighlight={deleteHighlight}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Note Input */}
            <NoteInput
                selection={selection}
                editingNote={editingNote}
                setEditingNote={setEditingNote}
                addHighlight={addHighlight}
                cancelHighlight={cancelHighlight}
                noteInputRef={noteInputRef}
            />
        </div>
    );
};

export default ArticleDetail;