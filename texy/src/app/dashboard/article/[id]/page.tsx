"use client"

import React, { useState, useRef } from 'react';
import { Bookmark, ExternalLink, Share2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import SidebarComponent from '../../components/Sidebar';
import GeoImpactWidget from '../../components/GeoImpactWidget';
import KeywordsWidget from '../../components/KeywordsWidget';
import IntelligenceSidebar from '../../components/IntelligenceSidebar';
import NoteInput from '../../components/NoteInput';
import { useFilteredArticles } from '@/hooks/useArticles';
import { usePathname } from 'next/navigation';
import { TrendingCard } from '@/components/features/trending-card/TrendingCard';

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

const KEYWORDS = ['CVE-2024-2389', 'Jenkins', 'RCE', 'CLI', 'args4j', 'Security'];

// Article content as structured data
const ARTICLE_CONTENT = {
    lead: "Security researchers have disclosed a critical security flaw in the Jenkins continuous integration and continuous delivery (CI/CD) server that could allow unauthenticated attackers to execute arbitrary code on susceptible systems.",
    paragraphs: [
        "The vulnerability, tracked as CVE-2024-2389, has been assigned a CVSS score of 9.8, indicating critical severity. It stems from a command injection bug in the CLI command parser.",
        "Jenkins uses a library called args4j to parse command arguments and options on the Jenkins controller when processing CLI commands. This command parser has a feature that replaces an @ character followed by a file path in an argument with the file's contents (expandAtFiles).",
    ],
    sections: [
        {
            title: "The Impact",
            paragraphs: [
                "Successful exploitation of this flaw allows attackers to read arbitrary files on the Jenkins controller file system using the default character encoding of the Jenkins controller process.",
                "Usually, Jenkins CLI commands that allow file upload or download are restricted to users with Overall/Read and/or Job/Read permissions. However, this vulnerability allows unauthenticated access to these features."
            ]
        },
        {
            title: "Mitigation Strategies",
            paragraphs: [
                "The issue has been addressed in Jenkins 2.442, LTS 2.426.3. As a temporary workaround, administrators are advised to disable access to the CLI."
            ]
        }
    ],
    note: "This vulnerability is already being exploited in the wild. Immediate patching is recommended.",
    conclusion: "Organizations using Jenkins should audit their access logs for any suspicious activity related to the CLI interface and ensure their instances are not exposed to the public internet without necessary access controls."
};

const ArticleDetail = () => {

    const pathname = usePathname();
    const { articles } = useFilteredArticles();
    const articleId = pathname.split('/').pop();
    const article = articles.find((article) => article.id === articleId);

    console.log(pathname, article);

    const [isSaved, setIsSaved] = useState(false);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('notes');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingNote, setEditingNote] = useState('');
    const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const contentRef = useRef<HTMLDivElement>(null);
    const noteInputRef = useRef<HTMLInputElement>(null);

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
                top: rect.top - 120,
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

    // Helper to render text with highlights
    const renderTextWithHighlights = (text: string) => {
        if (highlights.length === 0) return text;

        let result: React.ReactNode[] = [];
        let lastIndex = 0;

        const sortedHighlights = [...highlights].sort((a, b) => {
            const aIndex = text.indexOf(a.text);
            const bIndex = text.indexOf(b.text);
            return aIndex - bIndex;
        });

        sortedHighlights.forEach((highlight) => {
            const index = text.indexOf(highlight.text, lastIndex);
            if (index !== -1) {
                if (index > lastIndex) {
                    result.push(text.substring(lastIndex, index));
                }
                result.push(
                    <mark
                        key={highlight.id}
                        className="bg-yellow-200 px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors"
                        title={highlight.note || 'Click to edit note'}
                    >
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

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto" onMouseUp={handleMouseUp}>
                    <div className="border-b border-gray-200 bg-white sticky top-0 z-20 px-8 lg:px-12 py-4">
                        <div className="max-w-3xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-medium">Security</span>
                                <span className="text-slate-300">/</span>
                                <span>The Hacker News</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsSaved(!isSaved)}
                                    className={`p-2 transition-colors ${isSaved ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800 transition-colors"
                                >
                                    Read Original <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mb-6 leading-tight">
                                Critical RCE Vulnerability Discovered in Jenkins CI/CD Server
                            </h1>

                            <div className="flex items-center gap-4 mb-8 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <span className="font-medium text-slate-900">Ravie Lakshmanan</span>
                                </div>
                                <span>•</span>
                                <span>4 hours ago</span>
                                <span>•</span>
                                <span>5 min read</span>
                            </div>

                            <div ref={contentRef} className="prose prose-slate prose-lg max-w-none">
                                <p className="lead text-xl text-slate-600 mb-8">
                                    {renderTextWithHighlights(ARTICLE_CONTENT.lead)}
                                </p>

                                {ARTICLE_CONTENT.paragraphs.map((para, idx) => (
                                    <p key={idx} className="mb-6">
                                        {renderTextWithHighlights(para)}
                                    </p>
                                ))}

                                {ARTICLE_CONTENT.sections.map((section, sectionIdx) => (
                                    <React.Fragment key={sectionIdx}>
                                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">{section.title}</h3>
                                        {section.paragraphs.map((para, paraIdx) => (
                                            <p key={paraIdx} className="mb-6">
                                                {renderTextWithHighlights(para)}
                                            </p>
                                        ))}
                                    </React.Fragment>
                                ))}

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
                                    <p className="text-yellow-800 text-sm font-medium">
                                        <strong>Note:</strong> {renderTextWithHighlights(ARTICLE_CONTENT.note)}
                                    </p>
                                </div>

                                <p>
                                    {renderTextWithHighlights(ARTICLE_CONTENT.conclusion)}
                                </p>
                            </div>

                            <TrendingCard
                                title="Trend of the word Phishing • Declining"
                                data={trendData}
                                dataKey="value"
                                color="orange"
                                className="mx-auto mt-8"
                            />

                            {/* Feedback Dialog */}
                            <div className="mt-8 p-6 rounded-2xl border border-gray-200 bg-white">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Was the article summarized to your liking?
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Your feedback helps us improve our AI summaries
                                    </p>

                                    {!feedbackGiven ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setFeedbackGiven('positive')}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-colors"
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                Yes, it was helpful
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFeedbackGiven('negative');
                                                    setShowFeedbackInput(true);
                                                }}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors"
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                Could be better
                                            </button>
                                        </div>
                                    ) : feedbackGiven === 'positive' ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <ThumbsUp className="w-5 h-5" />
                                                <span className="font-medium">Thanks for your feedback!</span>
                                            </div>
                                            <button
                                                onClick={() => setShowFeedbackInput(true)}
                                                className="text-sm text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-1"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Add additional comments
                                            </button>
                                        </div>
                                    ) : !showFeedbackInput ? (
                                        <div className="flex items-center justify-center gap-2 text-slate-600">
                                            <span className="font-medium">Thanks for your feedback!</span>
                                        </div>
                                    ) : null}

                                    {showFeedbackInput && (
                                        <div className="mt-4 space-y-3">
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="Tell us how we can improve..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowFeedbackInput(false)}
                                                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // Handle feedback submission here
                                                        console.log('Feedback submitted:', { rating: feedbackGiven, comment: feedbackText });
                                                        setShowFeedbackInput(false);
                                                        setFeedbackText('');
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            
                        </div>
                    </div>
                </div>

                <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-screen overflow-hidden">
                    <GeoImpactWidget />
                    <KeywordsWidget keywords={KEYWORDS} />
                    <IntelligenceSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        highlights={highlights}
                        updateNote={updateNote}
                        deleteHighlight={deleteHighlight}
                    />
                </aside>
            </div>

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

const trendData = [
    { date: "2024-11-01", value: 120 },
    { date: "2024-11-05", value: 185 },
    { date: "2024-11-10", value: 220 },
    { date: "2024-11-15", value: 310 },
    { date: "2024-11-20", value: 275 },
    { date: "2024-11-25", value: 420 },
    { date: "2024-11-29", value: 380 },
]