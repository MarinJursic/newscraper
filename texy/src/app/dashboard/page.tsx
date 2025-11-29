"use client";

import { useState } from "react";
import HeroSection from "./components/HeroSection";
import TrendingWidget from "./components/TrendingWidget";
import { TrendingTopicsWidget } from "@/components/features/trending-topics-widget/TrendingTopicsWidget";
import { useFilteredArticles } from "../../hooks/useArticles";
import ArticlesStore from "./components/ArticlesStore";

const Dashboard = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { articles, categories, trendingKeywords, statistics, loading, error } =
    useFilteredArticles(activeCategory, searchQuery);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen overflow-y-auto relative no-scrollbar bg-white">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-8 mx-auto w-full">
        <HeroSection
          activeCategory={activeCategory}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <ArticlesStore
            articles={articles}
            title="Latest Intelligence"
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="lg:col-span-1 space-y-6">
            {trendingKeywords && statistics && (
              <TrendingWidget
                keywords={trendingKeywords}
                totalArticles={statistics.total_articles}
              />
            )}
            {trendingKeywords && (
              <TrendingTopicsWidget keywords={trendingKeywords} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
