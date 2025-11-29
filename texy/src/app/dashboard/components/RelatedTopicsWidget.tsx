import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface RelatedTopicsWidgetProps {
    recommended?: Array<{ topic: string; type: string; growth: string }>;
    relatedTopics?: any[];
}

const RelatedTopicsWidget: React.FC<RelatedTopicsWidgetProps> = ({ recommended, relatedTopics }) => {
    if ((!recommended || recommended.length === 0) && (!relatedTopics || relatedTopics.length === 0)) {
        return null;
    }

    const displayItems = recommended || relatedTopics || [];

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Lightbulb className="w-3 h-3" /> Related Topics
            </h3>
            <div className="space-y-2">
                {displayItems.slice(0, 6).map((item, idx) => {
                    const topic = item.topic || item.query || item.name || String(item);
                    const growth = item.growth || item.type || '';
                    const isRising = growth.toLowerCase().includes('rising') || growth.toLowerCase().includes('breakout');
                    
                    return (
                        <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isRising && (
                                    <TrendingUp className="w-3 h-3 text-violet-600 flex-shrink-0" />
                                )}
                                <span className="text-xs text-slate-700 truncate">{topic}</span>
                            </div>
                            {growth && (
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    isRising 
                                        ? 'bg-violet-50 text-violet-600' 
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {growth}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RelatedTopicsWidget;

