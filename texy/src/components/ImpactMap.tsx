"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorldMap from "@/components/WorldMap";

const ImpactMap: React.FC = () => {
  const searchParams = useSearchParams();
  const activeFilters = searchParams.get("filters")?.split(",") || [];

  return (
    <Card className="w-full gap-2">
      <CardHeader className="">
        <CardTitle className="text-lg">Impact Map</CardTitle>
        {activeFilters.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Active filters: {activeFilters.join(", ")}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Severity Legend */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Impact Severity</h4>

          <div className="flex space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <WorldMap height="80dvh" />
      </CardContent>
    </Card>
  );
};

export default ImpactMap;
