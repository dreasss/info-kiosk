"use client";

import { useState, useRef, useEffect } from "react";
import { CategoryFilter } from "@/components/ui/category-filter";
import type { POICategory } from "@/types/poi";
import { GripVertical } from "lucide-react";

interface DraggableFilterProps {
  onFilterChange: (category: POICategory | "all") => void;
}

export function DraggableFilter({ onFilterChange }: DraggableFilterProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-20 flex justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-2 max-w-4xl w-full">
        <CategoryFilter onFilterChange={onFilterChange} />
      </div>
    </div>
  );
}
