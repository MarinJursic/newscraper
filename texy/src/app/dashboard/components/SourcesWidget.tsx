import React from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { ArticleSource } from '@/types/articles';

interface SourcesWidgetProps {
    sources?: ArticleSource[];
}

const SourcesWidget: React.FC<SourcesWidgetProps> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Link2 className="w-3 h-3" /> Related Sources
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {sources.slice(0, 8).map((source, idx) => (
                    <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                        {source.favicon && (
                            <img 
                                src={source.favicon} 
                                alt={source.domain}
                                className="w-4 h-4 rounded"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-700 truncate group-hover:text-violet-600">
                                {source.name || source.domain}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{source.domain}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-violet-600 flex-shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SourcesWidget;

