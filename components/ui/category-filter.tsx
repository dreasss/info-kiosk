"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types/poi";
import {
  Building,
  Landmark,
  DoorOpen,
  Utensils,
  Music,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  onFilterChange: (category: string) => void;
  className?: string;
}

const categoryIcons = {
  building: Building,
  attraction: Landmark,
  entrance: DoorOpen,
  food: Utensils,
  entertainment: Music,
};

export function CategoryFilter({
  onFilterChange,
  className,
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onFilterChange(category);
  };

  return (
    <div className={cn("bg-transparent", className)}>
      <div className="flex items-center mb-3 px-1">
        <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
          <Filter className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-gray-800">
          Категории объектов
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {/* Кнопка "Все" */}
        <button
          onClick={() => handleCategoryClick("all")}
          className={cn(
            "group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md",
            activeCategory === "all"
              ? "bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-lg scale-105"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200",
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-300",
              activeCategory === "all"
                ? "bg-white/20"
                : "bg-gray-200 group-hover:bg-gray-300",
            )}
          >
            <div className="w-4 h-4 bg-current rounded-sm opacity-80"></div>
          </div>
          <span className="text-xs font-medium leading-tight">Все</span>
          {activeCategory === "all" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          )}
        </button>

        {/* Кнопки категорий */}
        {Object.entries(CATEGORIES).map(([key, category]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          const isActive = activeCategory === key;

          return (
            <button
              key={key}
              onClick={() => handleCategoryClick(key)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md",
                isActive
                  ? "text-white shadow-lg scale-105"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200",
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                    }
                  : undefined
              }
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-300",
                  isActive ? "bg-white/20" : "group-hover:scale-110",
                )}
                style={
                  !isActive
                    ? { backgroundColor: `${category.color}20` }
                    : undefined
                }
              >
                <Icon
                  className="w-4 h-4 transition-all duration-300"
                  style={{ color: isActive ? "white" : category.color }}
                />
              </div>
              <span className="text-xs font-medium leading-tight text-center">
                {category.name}
              </span>
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
