"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import WorldMap from "@/components/WorldMap";

const ImpactMap: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="w-full p-0">
        {/* Map Container */}
        <div className="">
          <WorldMap height="60dvh" />
        </div>
      </Card>

      <div className="">
        <div className="flex gap-4 items-center text-xs">
          <h4 className="text-sm font-medium">Impact Severity:</h4>

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
    </div>
  );
};

export default ImpactMap;
