"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize } from "lucide-react";

interface WorldMapProps {
  height: string;
  showFullScreen?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({
  height,
  showFullScreen = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // Create root element
    const root = am5.Root.new(chartRef.current);

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
    };

    // Mock severity data for countries
    const countrySeverities: Record<string, number> = {
      "United States": 3, // High
      China: 2, // Medium
      Croatia: 1, // Low
    };

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
        ? severityColors[severity as keyof typeof severityColors]
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
  }, []);

  return (
    <div className="relative">
      <div
        ref={chartRef}
        style={{ width: "100%", height }}
        className="border rounded"
      ></div>

      {showFullScreen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-auto sm:max-w-auto w-[80dvw] h-[80dvh] p-0">
            <WorldMap height="100%" showFullScreen={false} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WorldMap;
