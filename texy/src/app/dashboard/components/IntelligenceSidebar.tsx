import React from 'react';
import { FileText, Bot, Send, Trash2 } from 'lucide-react';

interface Highlight {
    id: string;
    text: string;
    note: string;
    color: string;
}

interface IntelligenceSidebarProps {
    activeTab: 'chat' | 'notes';
    setActiveTab: (tab: 'chat' | 'notes') => void;
    highlights: Highlight[];
    updateNote: (id: string, note: string) => void;
    deleteHighlight: (id: string) => void;
}

const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({
    activeTab,
    setActiveTab,
    highlights,
    updateNote,
    deleteHighlight
}) => {
    return (
        <>
            <div className="flex border-b border-gray-200 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`cursor-pointer flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'notes'
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Notes
                    {highlights.length > 0 && (
                        <span className="bg-violet-100 text-violet-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {highlights.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`cursor-pointer flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'chat'
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Bot className="w-4 h-4" />
                    Copilot
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'notes' ? (
                    <div className="space-y-4">
                        {highlights.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Select text to add a note.</p>
                                <p className="text-xs mt-1">Highlights appear inline.</p>
                            </div>
                        ) : (
                            highlights.map((highlight) => (
                                <div key={highlight.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 group hover:border-violet-200 transition-colors">
                                    <div className="border-l-2 border-yellow-400 pl-3 mb-3">
                                        <p className="text-xs text-slate-600 italic line-clamp-3">
                                            "{highlight.text}"
                                        </p>
                                    </div>
                                    <textarea
                                        placeholder="Add a comment..."
                                        value={highlight.note}
                                        onChange={(e) => updateNote(highlight.id, e.target.value)}
                                        className="w-full text-sm bg-white border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 rounded p-2 mb-2 resize-none transition-all outline-none"
                                        rows={2}
                                    />
                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteHighlight(highlight.id)}
                                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4 mb-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-violet-600" />
                                </div>
                                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg rounded-tl-none text-sm text-slate-600">
                                    I've analyzed this article about CVE-2024-2389 in Jenkins. How can I help?
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask Copilot..."
                                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-violet-600 hover:bg-violet-50 rounded-full">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default IntelligenceSidebar;
