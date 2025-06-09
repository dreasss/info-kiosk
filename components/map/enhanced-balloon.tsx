"use client"

import { useEffect, useRef } from "react"
import type { POI } from "@/types/poi"
import { CATEGORIES } from "@/types/poi"
import { MapPin, Info } from "lucide-react"

interface EnhancedBalloonProps {
  poi: POI
  onShowRoute: (poi: POI) => void
  onShowDetail: (poi: POI) => void
}

export function createEnhancedBalloonContent(poi: POI, poiId: string): string {
  const category = CATEGORIES[poi.category]

  return `
    <div class="balloon-container" style="width: 280px; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; border-radius: 8px;">
      <div class="balloon-image" style="position: relative; height: 140px; overflow: hidden; border-radius: 8px 8px 0 0;">
        <img 
          src="${poi.images[0] || "/placeholder.svg?height=140&width=280"}" 
          alt="${poi.name}" 
          style="width: 100%; height: 100%; object-fit: cover;"
        />
        <div class="balloon-category" style="position: absolute; top: 10px; right: 10px; background-color: ${category.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
          ${category.name}
        </div>
      </div>
      
      <div class="balloon-content" style="padding: 12px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${poi.name}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">${poi.shortDescription}</p>
        
        <div class="balloon-address" style="display: flex; align-items: center; margin-bottom: 12px; font-size: 12px; color: #4b5563;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px; min-width: 14px;">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${poi.address}
        </div>
        
        <div class="balloon-buttons" style="display: flex; gap: 8px;">
          <button 
            id="route-btn-${poiId}" 
            class="balloon-button route-button" 
            style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px;">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Маршрут
          </button>
          
          <button 
            id="detail-btn-${poiId}" 
            class="balloon-button detail-button" 
            style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px 12px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px;">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Подробнее
          </button>
        </div>
      </div>
    </div>
  `
}

export default function EnhancedBalloon({ poi, onShowRoute, onShowDetail }: EnhancedBalloonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const routeBtn = container.querySelector(".route-button")
    const detailBtn = container.querySelector(".detail-button")

    const handleRouteClick = () => {
      onShowRoute(poi)
    }

    const handleDetailClick = () => {
      onShowDetail(poi)
    }

    routeBtn?.addEventListener("click", handleRouteClick)
    detailBtn?.addEventListener("click", handleDetailClick)

    return () => {
      routeBtn?.removeEventListener("click", handleRouteClick)
      detailBtn?.removeEventListener("click", handleDetailClick)
    }
  }, [poi, onShowRoute, onShowDetail])

  return (
    <div ref={containerRef} className="enhanced-balloon">
      <div className="balloon-image relative h-36 overflow-hidden rounded-t-lg">
        <img
          src={poi.images[0] || "/placeholder.svg?height=140&width=280"}
          alt={poi.name}
          className="w-full h-full object-cover"
        />
        <div
          className="balloon-category absolute top-2 right-2 text-white text-xs font-medium px-2 py-1 rounded"
          style={{ backgroundColor: CATEGORIES[poi.category].color }}
        >
          {CATEGORIES[poi.category].name}
        </div>
      </div>

      <div className="balloon-content p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-2">{poi.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{poi.shortDescription}</p>

        <div className="balloon-address flex items-center mb-3 text-xs text-gray-500">
          <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
          {poi.address}
        </div>

        <div className="balloon-buttons flex gap-2">
          <button
            className="route-button flex-1 flex items-center justify-center py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition transform hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onShowRoute(poi)}
          >
            <MapPin className="h-4 w-4 mr-1.5" />
            Маршрут
          </button>

          <button
            className="detail-button flex-1 flex items-center justify-center py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-200 rounded-md transition transform hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onShowDetail(poi)}
          >
            <Info className="h-4 w-4 mr-1.5" />
            Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}
