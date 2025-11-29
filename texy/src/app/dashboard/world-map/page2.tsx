"use client";

import ImpactMap from "@/components/ImpactMap";
import MapCard from "@/components/MapCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TAGS = [
  { id: "all", label: "All", color: "bg-slate-900 text-white" },
  { id: "AI", label: "AI", color: "bg-violet-100 text-violet-700" },
  { id: "Python", label: "Python", color: "bg-blue-100 text-blue-700" },
  { id: "Security", label: "Cybersecurity", color: "bg-red-100 text-red-700" },
  { id: "Startups", label: "Startups", color: "bg-amber-100 text-amber-700" },
  { id: "Crypto", label: "Crypto", color: "bg-emerald-100 text-emerald-700" },
  { id: "DevOps", label: "DevOps", color: "bg-cyan-100 text-cyan-700" },
  { id: "Web", label: "Web Dev", color: "bg-pink-100 text-pink-700" },
];

export default function WorldMapPage() {
  const [activeTag, setActiveTag] = useState("all");

  // Reset to page 1 when filters change
  const handleTagChange = (tagId: string) => {
    setActiveTag(tagId);
  };

  return (
    <div className="mx-auto py-8 h-full">
      {/* Tags Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {TAGS.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagChange(tag.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
              activeTag === tag.id
                ? "bg-slate-900 text-white shadow-md"
                : "bg-gray-100 text-slate-600 hover:bg-gray-200 hover:text-slate-900"
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <ImpactMap />

      <MapCard />
    </div>
  );
}
