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
  Sparkles,
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
    <div className={cn("", className)}>
      {/* Заголовок с современным дизайном */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg">
          <div className="p-2 bg-white/20 rounded-xl mr-3 backdrop-blur-sm">
            <Filter className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">Категории объектов</span>
          <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
        </div>
      </div>

      {/* Кнопки в горизонтальном ряду */}
      <div className="flex gap-3 justify-center overflow-x-auto pb-2">
        {/* Кнопка "Все" */}
        <button
          onClick={() => handleCategoryClick("all")}
          className={cn(
            "group relative flex flex-col items-center justify-center px-4 py-3 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 min-w-[90px] overflow-hidden",
            activeCategory === "all"
              ? "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-2xl scale-105 shadow-slate-500/30"
              : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl",
          )}
        >
          {/* Анимированный фон для активной кнопки */}
          {activeCategory === "all" && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            </>
          )}

          <div
            className={cn(
              "w-8 h-8 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 relative z-10",
              activeCategory === "all"
                ? "bg-white/20 backdrop-blur-sm shadow-lg"
                : "bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-slate-300 group-hover:to-slate-400 shadow-md",
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-md transition-all duration-300",
                activeCategory === "all"
                  ? "bg-white shadow-lg"
                  : "bg-gradient-to-br from-slate-600 to-slate-700",
              )}
            ></div>
          </div>
          <span className="text-xs font-bold leading-tight relative z-10">
            Все объекты
          </span>
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
                "group relative flex flex-col items-center justify-center px-4 py-3 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 min-w-[90px] overflow-hidden",
                isActive
                  ? "text-white shadow-2xl scale-105"
                  : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl",
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${category.color}, ${category.color}dd, ${category.color}aa)`,
                      boxShadow: `0 20px 40px ${category.color}30, 0 10px 20px rgba(0,0,0,0.2)`,
                    }
                  : undefined
              }
            >
              {/* Анимированный фон для активной кнопки */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                </>
              )}

              <div
                className={cn(
                  "w-8 h-8 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 relative z-10",
                  isActive
                    ? "bg-white/20 backdrop-blur-sm shadow-lg group-hover:scale-110"
                    : "group-hover:scale-110 shadow-md",
                )}
                style={
                  !isActive
                    ? {
                        background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                        border: `2px solid ${category.color}30`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-4 h-4 transition-all duration-300 relative z-10"
                  style={{
                    color: isActive ? "white" : category.color,
                    filter: isActive
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                  }}
                />
              </div>
              <span className="text-xs font-bold leading-tight text-center relative z-10">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Декоративная полоска внизу */}
      <div className="mt-4 flex justify-center">
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-30"></div>
      </div>
    </div>
  );
}
