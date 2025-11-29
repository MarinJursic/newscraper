import React from 'react';
import { MapPin, Globe } from 'lucide-react';

interface GeoLocation {
    iso_code: string;
    country_name: string;
    severity: number;
    reason: string;
}

interface GeoImpactWidgetProps {
    locations?: GeoLocation[];
}

// Približne koordinate na standardnoj World Map projekciji (u postocima)
const COORDINATES: Record<string, { top: string; left: string }> = {
    'US': { top: '35%', left: '20%' }, // USA
    'DE': { top: '28%', left: '52%' }, // Germany
    'CN': { top: '35%', left: '75%' }, // China
    'RU': { top: '20%', left: '65%' }, // Russia
    'BR': { top: '70%', left: '30%' }, // Brazil
    'default': { top: '50%', left: '50%' }
};

const GeoImpactWidget = ({ locations = [] }: GeoImpactWidgetProps) => {
    // Ako nema podataka, ne prikazujemo ništa ili default
    const activeLocations = locations.length > 0 ? locations : [];

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Geo-Impact
                </h3>
                {activeLocations.some(l => l.severity > 2) && (
                    <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full animate-pulse border border-red-100">
                        High Activity
                    </span>
                )}
            </div>

            {/* Map Container */}
            <div className="aspect-video bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200 shadow-inner group">
                {/* Ovdje bi idealno išao SVG World Map kao background-image */}
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                    alt="World Map"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-multiply"
                />

                {/* Render Dots dynamically */}
                {activeLocations.map((loc) => {
                    const coords = COORDINATES[loc.iso_code] || COORDINATES['default'];
                    const isSevere = loc.severity >= 3;

                    return (
                        <div
                            key={loc.iso_code}
                            className="absolute cursor-help group/dot"
                            style={{ top: coords.top, left: coords.left }}
                        >
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSevere ? 'bg-red-400' : 'bg-orange-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isSevere ? 'bg-red-600' : 'bg-orange-500'}`}></span>
                            </span>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/dot:block z-10 w-32">
                                <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg leading-tight text-center">
                                    <div className="font-bold">{loc.country_name}</div>
                                    <div className="text-slate-300 mt-1">{loc.reason}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {activeLocations.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        No geographic data
                    </div>
                )}
            </div>

            {/* Footer List */}
            <div className="mt-3 space-y-1">
                {activeLocations.map(loc => (
                    <div key={loc.iso_code} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">{loc.country_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${loc.severity >= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-600'
                            }`}>
                            Sev: {loc.severity}/5
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeoImpactWidget;