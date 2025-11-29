"use client";

import { Hash } from "lucide-react";

interface TrendingTopicsWidgetProps {
  keywords?: Array<{ tag: string; count: number; keyword: string }>;
}

export function TrendingTopicsWidget({
  keywords = [],
}: TrendingTopicsWidgetProps) {
  // Use provided keywords or show empty state - show more topics
  const displayTopics = keywords.slice(0, 12).map((kw) => ({
    name: kw.keyword || kw.tag.replace("#", ""),
    count: kw.count,
  }));

  if (displayTopics.length === 0) {
    return (
      <div className="p-3 border rounded-xl bg-purple-50 w-full">
        <h1 className="pl-2 py-3 text-sm font-bold text-purple-900">
          Trending Topics
        </h1>
        <div className="flex flex-col p-6 border rounded-xl bg-white">
          <p className="text-sm text-muted-foreground text-center py-8">
            No trending topics available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border rounded-xl bg-purple-50 w-full">
      <h1 className="pl-2 py-3 text-sm font-bold text-purple-900">
        Trending Topics
      </h1>
      <div className="flex flex-col p-5 border rounded-xl bg-white space-y-3 max-h-[500px] overflow-y-auto">
        {displayTopics.map((topic) => (
          <div
            key={topic.name}
            className="flex items-center justify-between py-2 px-2 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <Hash className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium truncate">{topic.name}</span>
            </div>
            <span className="text-xs text-purple-700 bg-purple-100 font-bold shrink-0 ml-3 px-2.5 py-1 rounded-full">
              {topic.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
