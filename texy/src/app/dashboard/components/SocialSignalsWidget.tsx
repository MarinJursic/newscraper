import React from 'react';
import { MessageSquare, TrendingUp, Twitter } from 'lucide-react';
import { SocialSignals } from '@/types/articles';

interface SocialSignalsWidgetProps {
    signals?: SocialSignals;
}

const SocialSignalsWidget: React.FC<SocialSignalsWidgetProps> = ({ signals }) => {
    if (!signals) return null;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <MessageSquare className="w-3 h-3" /> Social Signals
            </h3>
            
            <div className="space-y-3">
                {/* Reddit */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-[10px] font-bold text-orange-600">R</span>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-700">Reddit</div>
                            <div className="text-[10px] text-slate-500">
                                {signals.reddit_posts_24h || 0} posts (24h)
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{signals.reddit_score || 0}</div>
                        <div className={`text-[10px] ${signals.reddit_sentiment === 'positive' ? 'text-emerald-600' : 
                            signals.reddit_sentiment === 'negative' ? 'text-red-600' : 'text-slate-400'}`}>
                            {signals.reddit_sentiment || 'neutral'}
                        </div>
                    </div>
                </div>

                {/* HackerNews */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-[10px] font-bold text-orange-600">Y</span>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-700">HackerNews</div>
                            <div className="text-[10px] text-slate-500">
                                {signals.hackernews_posts_24h || 0} posts (24h)
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{signals.hackernews_score || 0}</div>
                        {signals.hackernews_posts_24h > 0 && (
                            <div className="text-[10px] text-slate-400">Active</div>
                        )}
                    </div>
                </div>

                {/* Twitter Estimate */}
                {signals.twitter_estimated > 0 && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <Twitter className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-700">Twitter</div>
                                <div className="text-[10px] text-slate-500">Estimated mentions</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">{signals.twitter_estimated}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialSignalsWidget;

