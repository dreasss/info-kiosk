"use client";

import { useState, useRef, useEffect } from "react";
import { CategoryFilter } from "@/components/ui/category-filter";
import type { POICategory } from "@/types/poi";
import { GripVertical } from "lucide-react";

interface DraggableFilterProps {
  onFilterChange: (category: POICategory | "all") => void;
}

export function DraggableFilter({ onFilterChange }: DraggableFilterProps) {
  const [position, setPosition] = useState({ x: 50, y: 20 }); // процент от размера экрана
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const filterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = filterRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = ((e.clientX - dragStart.x) / window.innerWidth) * 100;
    const newY = ((e.clientY - dragStart.y) / window.innerHeight) * 100;

    // Ограничиваем движение в пределах экрана
    const boundedX = Math.max(0, Math.min(85, newX));
    const boundedY = Math.max(0, Math.min(90, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={filterRef}
      className="absolute z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-2"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <CategoryFilter onFilterChange={onFilterChange} />
        </div>
      </div>
    </div>
  );
}
