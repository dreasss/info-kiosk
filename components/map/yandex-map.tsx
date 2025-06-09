"use client"

import { useState, useEffect, useRef } from "react"
import {
  YMaps,
  Map,
  Placemark,
  ZoomControl,
  TypeSelector,
  GeolocationControl,
  FullscreenControl,
  Polyline,
} from "@pbe/react-yandex-maps"
import type { POI, POICategory } from "@/types/poi"
import { fetchPOIs, fetchPOIsByCategory, getRoute } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import { YANDEX_MAPS_API_KEY, MAP_CONFIG } from "@/lib/config"
import { createEnhancedBalloonContent } from "./enhanced-balloon"
import { CategoryFilter } from "@/components/ui/category-filter"

export default function YandexMap() {
  const [pois, setPois] = useState<POI[]>([])
  const [filteredPois, setFilteredPois] = useState<POI[]>([])
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [showRoute, setShowRoute] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [routeData, setRouteData] = useState<any>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [activeCategory, setActiveCategory] = useState<POICategory | "all">("all")
  const mapRef = useRef<any>(null)
  const { toast } = useToast()

  // Load POIs on component mount
  useEffect(() => {
    const loadPOIs = async () => {
      try {
        const data = await fetchPOIs()
        setPois(data)
        setFilteredPois(data)
      } catch (error) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить объекты на карте",
          variant: "destructive",
        })
      }
    }

    loadPOIs()
  }, [toast])

  // Filter POIs by category
  const handleFilterChange = async (category: string) => {
    setActiveCategory(category as POICategory | "all")
    try {
      const filtered = await fetchPOIsByCategory(category as POICategory | "all")
      setFilteredPois(filtered)
    } catch (error) {
      toast({
        title: "Ошибка фильтрации",
        description: "Не удалось отфильтровать объекты",
        variant: "destructive",
      })
    }
  }

  // Load route when showing route
  useEffect(() => {
    if (showRoute && selectedPoi) {
      loadRoute()
    } else {
      setRouteData(null)
    }
  }, [showRoute, selectedPoi])

  const loadRoute = async () => {
    if (!selectedPoi) return

    setLoadingRoute(true)
    try {
      const route = await getRoute(MAP_CONFIG.KIOSK_LOCATION, selectedPoi.coordinates)
      setRouteData(route)

      // Автоматически масштабируем карту для показа всего маршрута
      if (mapRef.current && route.coordinates.length > 0) {
        const bounds = route.coordinates.reduce(
          (bounds, coord) => {
            return [
              [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
              [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
            ]
          },
          [
            [route.coordinates[0][0], route.coordinates[0][1]],
            [route.coordinates[0][0], route.coordinates[0][1]],
          ],
        )

        // Добавляем небольшой отступ
        const padding = 0.001
        const extendedBounds = [
          [bounds[0][0] - padding, bounds[0][1] - padding],
          [bounds[1][0] + padding, bounds[1][1] + padding],
        ]

        mapRef.current.setBounds(extendedBounds, { checkZoomRange: true })
      }
    } catch (error) {
      console.error("Error loading route:", error)
      toast({
        title: "Ошибка маршрута",
        description: "Не удалось построить маршрут",
        variant: "destructive",
      })
    } finally {
      setLoadingRoute(false)
    }
  }

  const handleShowRoute = (poi: POI) => {
    setSelectedPoi(poi)
    setShowRoute(true)
  }

  const handleCloseRoute = () => {
    setShowRoute(false)
    setSelectedPoi(null)
    setRouteData(null)

    // Возвращаем карту к исходному масштабу
    if (mapRef.current) {
      mapRef.current.setCenter(MAP_CONFIG.KIOSK_LOCATION, MAP_CONFIG.DEFAULT_ZOOM)
    }
  }

  const handleShowDetail = (poi: POI) => {
    setSelectedPoi(poi)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  // Dynamically import the RouteModal component to avoid SSR issues
  const RouteModal = dynamic(() => import("./route-modal"), {
    ssr: false,
  })

  // Dynamically import the POIDetail component
  const POIDetail = dynamic(() => import("./poi-detail"), {
    ssr: false,
  })

  // Глобальные обработчики для кнопок в балунах
  useEffect(() => {
    ;(window as any).handleRouteClick = (poiId: string) => {
      const poi = pois.find((p) => p.id === poiId)
      if (poi) {
        handleShowRoute(poi)
      }
    }
    ;(window as any).handleDetailClick = (poiId: string) => {
      const poi = pois.find((p) => p.id === poiId)
      if (poi) {
        handleShowDetail(poi)
      }
    }

    return () => {
      delete (window as any).handleRouteClick
      delete (window as any).handleDetailClick
    }
  }, [pois])

  return (
    <div className="w-full h-screen relative" style={{ height: "100vh", width: "100%" }}>
      <YMaps
        query={{
          apikey: YANDEX_MAPS_API_KEY,
          lang: "ru_RU",
        }}
      >
        <Map
          defaultState={{
            center: MAP_CONFIG.KIOSK_LOCATION,
            zoom: MAP_CONFIG.DEFAULT_ZOOM,
            controls: [],
          }}
          width="100%"
          height="100%"
          modules={[
            "geoObject.addon.balloon",
            "geoObject.addon.hint",
            "control.ZoomControl",
            "control.FullscreenControl",
            "control.GeolocationControl",
            "control.TypeSelector",
          ]}
          instanceRef={(ref) => {
            if (ref) {
              mapRef.current = ref
            }
          }}
          options={{
            balloonMaxWidth: 300,
            balloonMaxHeight: 350,
          }}
        >
          {/* Маркер киоска */}
          <Placemark
            geometry={MAP_CONFIG.KIOSK_LOCATION}
            properties={{
              iconCaption: "Вы здесь",
              balloonContentHeader: "🏢 Информационный киоск",
              balloonContentBody: `
                <div style="text-align: center; padding: 10px;">
                  <p style="margin: 0; font-size: 14px;">Вы находитесь здесь</p>
                  <p style="margin: 5px 0 0; font-size: 12px; color: #666;">ул. Жолио-Кюри, 20, Дубна</p>
                </div>
              `,
              hintContent: "Информационный киоск",
            }}
            options={{
              preset: MAP_CONFIG.MARKER_STYLES.KIOSK,
              iconCaptionMaxWidth: "100",
            }}
          />

          {/* Маркеры POI */}
          {filteredPois.map((poi) => (
            <Placemark
              key={poi.id}
              geometry={poi.coordinates}
              properties={{
                balloonContent: createEnhancedBalloonContent(poi, poi.id),
                hintContent: poi.name,
                iconCaption: poi.name,
              }}
              options={{
                preset:
                  selectedPoi && selectedPoi.id === poi.id
                    ? MAP_CONFIG.MARKER_STYLES.SELECTED
                    : poi.iconUrl
                      ? undefined
                      : MAP_CONFIG.MARKER_STYLES.POI[poi.category],
                iconLayout: poi.iconUrl ? "default#image" : undefined,
                iconImageHref: poi.iconUrl,
                iconImageSize: poi.iconUrl ? [32, 32] : undefined,
                iconImageOffset: poi.iconUrl ? [-16, -32] : undefined,
                iconCaptionMaxWidth: "150",
              }}
            />
          ))}

          {/* Маршрут по дорогам */}
          {showRoute && routeData && routeData.coordinates.length > 0 && (
            <Polyline
              geometry={routeData.coordinates}
              options={{
                strokeColor: "#3b82f6",
                strokeWidth: 6,
                strokeOpacity: 0.8,
                strokeStyle: "solid",
              }}
            />
          )}

          {/* Элементы управления */}
          <ZoomControl options={{ float: "right" }} />
          <TypeSelector options={{ float: "right" }} />
          <GeolocationControl options={{ float: "left" }} />
          <FullscreenControl />
        </Map>
      </YMaps>

      {/* Фильтр категорий */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-auto">
        <CategoryFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Индикатор загрузки маршрута */}
      {loadingRoute && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Построение маршрута...</span>
          </div>
        </div>
      )}

      {/* Кнопка сброса маршрута */}
      {showRoute && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleCloseRoute}
            className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Сбросить маршрут
          </button>
        </div>
      )}

      {/* Route modal */}
      {showRoute && selectedPoi && (
        <RouteModal
          poi={selectedPoi}
          start={MAP_CONFIG.KIOSK_LOCATION}
          onClose={handleCloseRoute}
          routeData={routeData}
        />
      )}

      {/* POI detail modal */}
      {showDetail && selectedPoi && <POIDetail poi={selectedPoi} onClose={handleCloseDetail} />}
    </div>
  )
}
