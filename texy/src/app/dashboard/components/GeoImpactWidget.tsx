import React from 'react';
import { MapPin } from 'lucide-react';

const GeoImpactWidget = () => {
    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Geo-Impact
                </h3>
                <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                    High Activity
                </span>
            </div>
            <div className="aspect-video bg-slate-100 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-200">
                <div className="opacity-20 text-slate-400 text-xs font-medium">Interactive Map</div>
                <div className="absolute top-1/3 left-1/4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
                <div className="absolute top-1/4 right-1/3">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
                <strong>Affected:</strong> North America, Europe
            </div>
        </div>
    );
};

export default GeoImpactWidget;
