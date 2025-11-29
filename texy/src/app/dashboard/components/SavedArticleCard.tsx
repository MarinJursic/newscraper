import React from 'react';
import { MoreHorizontal, Folder, CheckCircle, Trash2 } from 'lucide-react';

interface SavedArticle {
    id: string;
    category: string;
    source: string;
    time: string;
    title: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'critical';
    isRead: boolean;
    folder?: string;
}

interface SavedArticleCardProps {
    article: SavedArticle;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onMoveToFolder: (id: string) => void;
    onMarkAsRead: (id: string) => void;
    onRemove: (id: string) => void;
}

const SavedArticleCard: React.FC<SavedArticleCardProps> = ({
    article,
    isSelected,
    onSelect,
    onMoveToFolder,
    onMarkAsRead,
    onRemove
}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <div
            className={`group bg-white rounded-xl border p-5 hover:shadow-md transition-all duration-300 flex flex-col h-full relative ${isSelected ? 'border-violet-300 ring-2 ring-violet-100' : 'border-gray-200 hover:border-violet-200'
                } ${article.isRead ? 'opacity-60' : ''}`}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(article.id)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 pl-8">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {article.source}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">{article.time}</span>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            ></div>
                            <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]">
                                <button
                                    onClick={() => {
                                        onMoveToFolder(article.id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Folder className="w-4 h-4" />
                                    Move to folder
                                </button>
                                <button
                                    onClick={() => {
                                        onMarkAsRead(article.id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {article.isRead ? 'Mark as unread' : 'Mark as read'}
                                </button>
                                <button
                                    onClick={() => {
                                        onRemove(article.id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-violet-600 transition-colors">
                {article.title}
            </h3>

            {/* Summary */}
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                {article.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span
                    className={`text-[10px] font-medium px-2 py-1 rounded-md ${article.category === 'Security'
                            ? 'text-red-700 bg-red-50'
                            : article.category === 'Python'
                                ? 'text-blue-700 bg-blue-50'
                                : article.category === 'AI'
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-slate-700 bg-slate-100'
                        }`}
                >
                    {article.category}
                </span>
                {article.isRead && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Read
                    </span>
                )}
            </div>
        </div>
    );
};

export default SavedArticleCard;
