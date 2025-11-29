"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const categories = [
  "Tax Reform",
  "Economic Policy",
  "Trade Agreements",
  "Corporate Tax",
  "Personal Income",
  "VAT Changes",
  "Digital Tax",
  "Carbon Tax",
  "Wealth Tax",
  "Property Tax",
];

export default function MapFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeFilters = searchParams.get("filters")?.split(",") || [];

  const toggleFilter = (category: string) => {
    const newFilters = activeFilters.includes(category)
      ? activeFilters.filter((f) => f !== category)
      : [...activeFilters, category];

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
        {categories.map((category) => {
          const isActive = activeFilters.includes(category);
          return (
            <Button
              key={category}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(category)}
              className="cursor-pointer"
            >
              {category}
              {isActive && <span className="ml-1">×</span>}
            </Button>
          );
        })}
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Active filters: {activeFilters.join(", ")}
        </div>
      )}
    </div>
  );
}
