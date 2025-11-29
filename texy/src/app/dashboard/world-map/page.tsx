"use client";

import { useState, useMemo } from "react";
import { Globe, Map, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ImpactMap from "@/components/ImpactMap";
import WorldMap from "@/components/WorldMap";

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

export default function ExplorePage() {
  const [activeTag, setActiveTag] = useState("all");

  // Pagination logic
  // Reset to page 1 when filters change
  const handleTagChange = (tagId: string) => {
    setActiveTag(tagId);
  };
  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto px-6 py-6">
          {/* Title Row */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-violet-500" />
              Impact map
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Discover how different article topics are making a global impact.
            </p>
          </div>

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
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto">
          <ImpactMap />
        </div>
      </div>
    </main>
  );
}
