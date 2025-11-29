import React from 'react';
import { BarChart3, Target, Heart, TrendingUp } from 'lucide-react';
import { ArticleScores } from '@/types/articles';

interface ScoresWidgetProps {
    scores?: ArticleScores;
}

const ScoresWidget: React.FC<ScoresWidgetProps> = ({ scores }) => {
    if (!scores) return null;

    const ScoreItem = ({ icon: Icon, label, value, color, maxValue = 100 }: { 
        icon: React.ElementType; 
        label: string; 
        value: number; 
        color: string;
        maxValue?: number;
    }) => {
        // Normalize value to 0-100 for display (sentiment is -100 to 100, others are 0-100)
        const normalizedValue = maxValue === 200 ? Math.abs(value) : value;
        const displayValue = maxValue === 200 ? value : normalizedValue;
        const percentage = maxValue === 200 ? (normalizedValue / 100) * 100 : (normalizedValue / maxValue) * 100;
        
        return (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${color} rounded flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs font-medium text-slate-700">{label}</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${color} transition-all`}
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-900 w-12 text-right">{displayValue}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <BarChart3 className="w-3 h-3" /> Scores
            </h3>
            <div className="space-y-2">
                <ScoreItem 
                    icon={Target} 
                    label="Confidence" 
                    value={Math.min(100, Math.max(0, scores.confidence_score || 0))} 
                    color="bg-blue-500"
                    maxValue={100}
                />
                <ScoreItem 
                    icon={BarChart3} 
                    label="Relevance" 
                    value={Math.min(100, Math.max(0, scores.relevance_score || 0))} 
                    color="bg-emerald-500"
                    maxValue={100}
                />
                <ScoreItem 
                    icon={Heart} 
                    label="Sentiment" 
                    value={Math.min(100, Math.max(-100, scores.sentiment_score || 0))} 
                    color={scores.sentiment_score < 0 ? "bg-red-500" : scores.sentiment_score > 0 ? "bg-emerald-500" : "bg-slate-400"}
                    maxValue={200}
                />
                <ScoreItem 
                    icon={TrendingUp} 
                    label="Trend" 
                    value={Math.min(100, Math.max(0, scores.trend_score || 0))} 
                    color="bg-violet-500"
                    maxValue={100}
                />
            </div>
        </div>
    );
};

export default ScoresWidget;

