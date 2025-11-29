"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

export default function MapFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeFilters = searchParams.get("filters")?.split(",") || [];

  const toggleFilter = (tagId: string) => {
    const newFilters = activeFilters.includes(tagId)
      ? activeFilters.filter((f) => f !== tagId)
      : [...activeFilters, tagId];

    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) {
      params.set("filters", newFilters.join(","));
    } else {
      params.delete("filters");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const isActive = activeFilters.includes(tag.id);
          return (
            <Button
              key={tag.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(tag.id)}
              className={cn("cursor-pointer", isActive ? tag.color : "")}
            >
              {tag.label}
              {isActive && <span className="ml-1">×</span>}
            </Button>
          );
        })}
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Active filters:{" "}
          {activeFilters
            .map((id) => TAGS.find((tag) => tag.id === id)?.label)
            .filter(Boolean)
            .join(", ")}
        </div>
      )}
    </div>
  );
}
