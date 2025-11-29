"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorldMap from "@/components/WorldMap";

const MapCard: React.FC = () => {
  return (
    <Card className="w-full max-w-sm gap-2">
      <CardHeader className="">
        <CardTitle className="text-lg">Impact Map</CardTitle>
      </CardHeader>

      <CardContent>
        <WorldMap height="400px" />
      </CardContent>
    </Card>
  );
};

export default MapCard;
