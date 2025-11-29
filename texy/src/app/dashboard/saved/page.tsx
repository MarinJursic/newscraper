"use client"

import React, { useState } from 'react';
import { Menu, Plus, FolderPlus, X, Folder as FolderIcon, Star, Clock, BookmarkIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LibraryStats from '../components/LibraryStats';
import SavedArticleCard from '../components/SavedArticleCard';
import EmptyState from '../components/EmptyState';
import TopTagsWidget from '../components/TopTagsWidget';

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
    isFavorite?: boolean;
}

interface Folder {
    id: string;
    name: string;
    icon: string;
    isDefault?: boolean;
}

// Mock Data
const MOCK_ARTICLES: SavedArticle[] = [
    {
        id: '1',
        category: 'Python',
        source: 'Real Python',
        time: '2 days ago',
        title: 'Python 3.13: The GIL is Finally Optional',
        summary: 'A deep dive into the experimental no-GIL build in Python 3.13 and what it means for multi-threaded performance.',
        sentiment: 'positive',
        isRead: false,
        folder: 'All Saved',
    },
    {
        id: '2',
        category: 'Security',
        source: 'The Hacker News',
        time: '3 days ago',
        title: 'Critical RCE Vulnerability in Jenkins',
        summary: 'CVE-2024-2389 allows unauthenticated attackers to execute arbitrary code. Patch immediately.',
        sentiment: 'critical',
        isRead: true,
        folder: 'All Saved',
        isFavorite: true,
    },
    {
        id: '3',
        category: 'AI',
        source: 'OpenAI Blog',
        time: '1 week ago',
        title: 'Sora: Creating Video from Text',
        summary: 'OpenAI introduces Sora, a text-to-video model capable of generating highly detailed scenes up to a minute long.',
        sentiment: 'positive',
        isRead: false,
        folder: 'Project Alpha',
        isFavorite: true,
    },
    {
        id: '4',
        category: 'AI',
        source: 'Hugging Face',
        time: '1 week ago',
        title: 'Mistral Large Released',
        summary: 'New flagship model rivals GPT-4 in reasoning capabilities and is available on Azure.',
        sentiment: 'positive',
        isRead: false,
        folder: 'Thesis Research',
    },
];

const DEFAULT_FOLDERS: Folder[] = [
    { id: 'all', name: 'All Saved', icon: '📂', isDefault: true },
    { id: 'read-later', name: 'Read Later', icon: '⏳', isDefault: true },
    { id: 'favorites', name: 'Favorites', icon: '⭐️', isDefault: true },
];

const TOP_TAGS = [
    { tag: '#AI', count: 24 },
    { tag: '#Python', count: 18 },
    { tag: '#Security', count: 15 },
    { tag: '#React', count: 12 },
    { tag: '#WebDev', count: 9 },
];

const SavedArticlesPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([
        ...DEFAULT_FOLDERS,
        { id: 'project-alpha', name: 'Project Alpha', icon: '🚀' },
        { id: 'thesis', name: 'Thesis Research', icon: '📚' },
    ]);
    const [activeFolder, setActiveFolder] = useState('all');
    const [articles, setArticles] = useState<SavedArticle[]>(MOCK_ARTICLES);
    const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [articleToMove, setArticleToMove] = useState<string | null>(null);

    const filteredArticles = articles.filter((article) => {
        if (activeFolder === 'all') return true;
        if (activeFolder === 'read-later') return !article.isRead;
        if (activeFolder === 'favorites') return article.isFavorite;

        const folder = folders.find(f => f.id === activeFolder);
        return article.folder === folder?.name;
    });

    const unreadCount = articles.filter(a => !a.isRead).length;
    const estimatedTime = unreadCount * 4; // 4 mins per article

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;

        const newFolder: Folder = {
            id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
            name: newFolderName,
            icon: '📁',
        };

        setFolders([...folders, newFolder]);
        setNewFolderName('');
        setShowNewFolderModal(false);
    };

    const handleSelectArticle = (id: string) => {
        setSelectedArticles(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleMoveToFolder = (articleId: string) => {
        setArticleToMove(articleId);
        setShowMoveModal(true);
    };

    const handleConfirmMove = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const articlesToMove = articleToMove ? [articleToMove] : selectedArticles;

        setArticles(prev =>
            prev.map(article =>
                articlesToMove.includes(article.id)
                    ? { ...article, folder: folder.name }
                    : article
            )
        );

        setShowMoveModal(false);
        setArticleToMove(null);
        setSelectedArticles([]);
    };

    const handleMarkAsRead = (id: string) => {
        setArticles(prev =>
            prev.map(article =>
                article.id === id ? { ...article, isRead: !article.isRead } : article
            )
        );
    };

    const handleRemove = (id: string) => {
        setArticles(prev => prev.filter(article => article.id !== id));
    };

    const handleBulkMove = () => {
        if (selectedArticles.length === 0) return;
        setShowMoveModal(true);
    };

    return (
        <main className="flex flex-col h-screen overflow-y-auto relative no-scrollbar bg-white">
            {/* Sticky Folder Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="text-xl font-bold font-serif">Blinkfeed.</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade w-full">
                        {folders.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => setActiveFolder(folder.id)}
                                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${activeFolder === folder.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                                    }`}
                            >
                                <span>{folder.icon}</span>
                                {folder.name}
                            </button>
                        ))}

                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-2 border-2 border-dashed border-gray-300 text-slate-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50"
                        >
                            <Plus className="w-4 h-4" />
                            New Collection
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Library Stats */}
                <LibraryStats unreadCount={unreadCount} estimatedTime={estimatedTime} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Article Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                {folders.find(f => f.id === activeFolder)?.name || 'All Saved'}
                            </h2>
                            <span className="text-sm text-slate-500">
                                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {filteredArticles.length === 0 ? (
                            <EmptyState folderName={folders.find(f => f.id === activeFolder)?.name || 'All Saved'} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredArticles.map((article) => (
                                    <SavedArticleCard
                                        key={article.id}
                                        article={article}
                                        isSelected={selectedArticles.includes(article.id)}
                                        onSelect={handleSelectArticle}
                                        onMoveToFolder={handleMoveToFolder}
                                        onMarkAsRead={handleMarkAsRead}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <TopTagsWidget tags={TOP_TAGS} />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedArticles.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-4">
                        <span className="text-sm font-medium">
                            {selectedArticles.length} selected
                        </span>
                        <div className="w-px h-6 bg-slate-700"></div>
                        <button
                            onClick={handleBulkMove}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                        >
                            <FolderIcon className="w-4 h-4" />
                            Move to folder
                        </button>
                        <button
                            onClick={() => setSelectedArticles([])}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Collection</h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Collection name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move to Folder Modal */}
            {showMoveModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Move to Folder</h3>
                        <div className="space-y-2 mb-4">
                            {folders.filter(f => !f.isDefault).map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleConfirmMove(folder.id)}
                                    className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-violet-50 hover:border-violet-300 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-xl">{folder.icon}</span>
                                    <span className="font-medium text-slate-900">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowMoveModal(false);
                                setArticleToMove(null);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default SavedArticlesPage;
