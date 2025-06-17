"use client";

import { CategoryFilter } from "@/components/ui/category-filter";
import type { POICategory } from "@/types/poi";

interface DraggableFilterProps {
  onFilterChange: (category: POICategory | "all") => void;
}

export function DraggableFilter({ onFilterChange }: DraggableFilterProps) {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-20 flex justify-center">
      <div className="bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-4 max-w-5xl w-full relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

        {/* Основной контент */}
        <div className="relative">
          <CategoryFilter onFilterChange={onFilterChange} />
        </div>
      </div>
    </div>
  );
}
