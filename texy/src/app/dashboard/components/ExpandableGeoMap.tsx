"use client"

import React, { useState, useLayoutEffect, useRef } from "react";
import { Globe, ChevronDown, ChevronUp, X } from "lucide-react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface GeoLocation {
    iso_code: string;
    country_name: string;
    severity: number;
    reason: string;
}

interface ExpandableGeoMapProps {
    locations?: GeoLocation[];
}

// ISO code to country name mapping for amCharts
const ISO_TO_COUNTRY_NAME: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'CN': 'China',
    'JP': 'Japan',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia',
    'RU': 'Russia',
    'KR': 'South Korea',
    'MX': 'Mexico',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'NZ': 'New Zealand',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'EU': 'European Union',
};

const ExpandableGeoMap: React.FC<ExpandableGeoMapProps> = ({ locations = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<am5.Root | null>(null);

    useLayoutEffect(() => {
        if (!isExpanded || !chartRef.current) return;

        // Create root element
        const root = am5.Root.new(chartRef.current);
        rootRef.current = root;

        // Set themes
        root.setThemes([am5themes_Animated.new(root)]);

        // Create the map chart
        const chart = root.container.children.push(
            am5map.MapChart.new(root, {
                panX: "translateX",
                panY: "translateY",
                projection: am5map.geoMercator(),
            })
        );

        // Create main polygon series for countries
        const polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldLow,
                exclude: ["AQ"],
            })
        );

        // Severity color mapping
        const severityColors = {
            1: am5.color("#e2d300"), // Yellow for low severity
            2: am5.color("#F59E0B"), // Orange for medium severity
            3: am5.color("#c70000"), // Red for high severity
            4: am5.color("#8B0000"), // Dark red for very high severity
            5: am5.color("#4B0000"), // Very dark red for critical severity
        };

        // Create country severity mapping from locations
        const countrySeverities: Record<string, number> = {};
        locations.forEach(loc => {
            const countryName = ISO_TO_COUNTRY_NAME[loc.iso_code] || loc.country_name;
            countrySeverities[countryName] = Math.max(
                countrySeverities[countryName] || 0,
                loc.severity
            );
        });

        polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}",
            toggleKey: "active",
            interactive: true,
        });

        // Set colors based on severity
        polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
            const dataContext = target.dataItem?.dataContext as { name?: string };
            const countryName = dataContext?.name;
            const severity = countrySeverities[countryName || ""] ?? 0;
            return severity > 0
                ? severityColors[Math.min(severity, 5) as keyof typeof severityColors] || am5.color("#D6D6DA")
                : am5.color("#D6D6DA");
        });

        polygonSeries.mapPolygons.template.states.create("hover", {
            fill: am5.color("#CCC"),
        });

        polygonSeries.mapPolygons.template.states.create("active", {
            fill: root.interfaceColors.get("primaryButtonHover"),
        });

        let previousPolygon: am5map.MapPolygon | undefined;

        polygonSeries.mapPolygons.template.on("active", function (active, target) {
            if (!target) return;

            if (previousPolygon && previousPolygon !== target) {
                previousPolygon.set("active", false);
            }
            if (target.get("active")) {
                polygonSeries.zoomToDataItem(
                    target.dataItem as am5.DataItem<am5map.IMapPolygonSeriesDataItem>
                );
            } else {
                chart.goHome();
            }
            previousPolygon = target;
        });

        // Add zoom control
        chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

        // Set clicking on "water" to zoom out
        const background = chart.chartContainer.get("background");
        if (background) {
            background.events.on("click", function () {
                chart.goHome();
            });
        }

        // Make stuff animate on load
        chart.appear(1000, 100);

        return () => {
            root.dispose();
        };
    }, [isExpanded, locations]);

    if (!locations || locations.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900">Geographic Impact</h3>
                        <p className="text-sm text-slate-500">
                            {locations.length} {locations.length === 1 ? 'region' : 'regions'} affected
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-gray-200">
                    <div className="p-4">
                        {/* Severity Legend */}
                        <div className="mb-4 flex items-center gap-4 text-xs">
                            <span className="font-medium text-slate-600">Severity:</span>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                                <span>Low (1)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                                <span>Medium (2)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-600 rounded"></div>
                                <span>High (3+)</span>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div 
                            ref={chartRef}
                            style={{ width: "100%", height: "500px" }}
                            className="border border-gray-200 rounded-lg"
                        ></div>

                        {/* Affected Regions List */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-3">Affected Regions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {locations.map((loc, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
                                    >
                                        <span className="font-medium text-slate-700">{loc.country_name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                                loc.severity >= 3 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : loc.severity >= 2 
                                                        ? 'bg-orange-100 text-orange-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                Severity {loc.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpandableGeoMap;

