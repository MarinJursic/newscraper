import React from 'react';
import { Zap, TrendingUp, Globe } from 'lucide-react';
import { Virality } from '@/types/articles';

interface ViralityWidgetProps {
    virality?: Virality;
}

const ViralityWidget: React.FC<ViralityWidgetProps> = ({ virality }) => {
    if (!virality) return null;

    const volumeColors: Record<string, string> = {
        low: 'bg-slate-100 text-slate-600',
        normal: 'bg-blue-50 text-blue-600',
        high: 'bg-orange-50 text-orange-600',
        viral: 'bg-red-50 text-red-600'
    };

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Zap className="w-3 h-3" /> Virality
            </h3>
            
            <div className="space-y-3">
                {/* Trending Status */}
                {virality.is_trending && (
                    <div className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <TrendingUp className="w-4 h-4 text-violet-600" />
                        <div className="flex-1">
                            <div className="text-xs font-bold text-violet-900">Trending Now</div>
                            <div className="text-[10px] text-violet-600">High interest detected</div>
                        </div>
                    </div>
                )}

                {/* Breakout Detection */}
                {virality.breakout_detected && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                        <Zap className="w-4 h-4 text-red-600" />
                        <div className="flex-1">
                            <div className="text-xs font-bold text-red-900">Breakout Detected</div>
                            <div className="text-[10px] text-red-600">Significant spike in activity</div>
                        </div>
                    </div>
                )}

                {/* News Volume */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-700">News Volume</div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${volumeColors[virality.news_volume] || volumeColors.normal}`}>
                        {virality.news_volume?.toUpperCase() || 'NORMAL'}
                    </span>
                </div>

                {/* Trending Regions */}
                {virality.trending_regions && virality.trending_regions.length > 0 && (
                    <div>
                        <div className="text-[10px] font-medium text-slate-500 mb-2 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Trending Regions
                        </div>
                        <div className="space-y-1">
                            {virality.trending_regions.slice(0, 3).map((region, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">{region.country}</span>
                                    <span className="text-slate-400 font-medium">{region.interest}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViralityWidget;

