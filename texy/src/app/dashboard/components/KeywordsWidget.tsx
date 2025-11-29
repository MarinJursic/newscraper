import React from 'react';
import { Tag } from 'lucide-react';
import { ArticleKeyword } from '@/types/articles';

interface KeywordsWidgetProps {
    keywords: string[] | ArticleKeyword[];
}

const KeywordsWidget: React.FC<KeywordsWidgetProps> = ({ keywords }) => {
    // Check if keywords have scores (ArticleKeyword[]) or are just strings
    const hasScores = keywords.length > 0 && typeof keywords[0] === 'object' && 'score' in keywords[0];
    
    // Sort by score if available
    const sortedKeywords = hasScores 
        ? [...(keywords as ArticleKeyword[])].sort((a, b) => (b.score || 0) - (a.score || 0))
        : keywords;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Tag className="w-3 h-3" /> Key Terms
            </h3>
            <div className="flex flex-wrap gap-2">
                {sortedKeywords.slice(0, 12).map((keyword, idx) => {
                    const keywordText = hasScores ? (keyword as ArticleKeyword).keyword : keyword as string;
                    const score = hasScores ? (keyword as ArticleKeyword).score : undefined;
                    const isHighScore = score && score >= 50;
                    
                    return (
                        <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-md hover:bg-slate-200 cursor-pointer transition-colors ${
                                isHighScore 
                                    ? 'bg-violet-100 text-violet-700 font-medium border border-violet-200' 
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                            title={score ? `Score: ${score}` : undefined}
                        >
                            {keywordText}
                            {score && (
                                <span className="ml-1 text-[10px] opacity-60">({score})</span>
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default KeywordsWidget;
