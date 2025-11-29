import React from 'react';
import { Tag } from 'lucide-react';

interface KeywordsWidgetProps {
    keywords: string[];
}

const KeywordsWidget: React.FC<KeywordsWidgetProps> = ({ keywords }) => {
    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Tag className="w-3 h-3" /> Key Terms
            </h3>
            <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                    <span
                        key={keyword}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md hover:bg-slate-200 cursor-pointer transition-colors"
                    >
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default KeywordsWidget;
