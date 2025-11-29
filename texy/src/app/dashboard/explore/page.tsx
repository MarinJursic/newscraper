"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import { useFilteredArticles } from "@/hooks/useArticles";
import { cn } from "@/lib/utils";

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

const ITEMS_PER_PAGE = 12;

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { articles, loading, error, trendingKeywords } = useFilteredArticles(
    activeTag === "all" ? "All" : activeTag,
    searchQuery
  );

  // Pagination logic
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [articles, currentPage]);

  // Reset to page 1 when filters change
  const handleTagChange = (tagId: string) => {
    setActiveTag(tagId);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll the main container (from dashboard layout) to top
    const mainContainer = document.querySelector(
      "main.h-screen.overflow-y-auto"
    );
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    <main className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto px-6 py-6">
          {/* Title Row */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" />
              Explore Articles
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Discover the latest in tech, security, and innovation
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
          {/* Search Bar */}
          <div className="relative w-full max-w-2xl mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Trending Keywords */}
          {trendingKeywords && trendingKeywords.length > 0 && (
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">Trending Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingKeywords.slice(0, 15).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.keyword)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors border border-violet-100"
                  >
                    <span>{item.keyword}</span>
                    <span className="bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {paginatedArticles.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {articles.length}
                  </span>{" "}
                  articles
                  {searchQuery && (
                    <span className="ml-1">
                      for "
                      <span className="text-violet-600">{searchQuery}</span>"
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </div>
                  <div className="h-5 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("all");
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((article, idx) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  idx={idx}
                  animate={false}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="w-10 h-10 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                  </>
                )}

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page >= currentPage - 2 && page <= currentPage + 2)
                      return true;
                    return false;
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-gray-100"
                      )}
                    >
                      {page}
                    </button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-10 h-10 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
