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
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { TouchButton } from "@/components/ui/touch-button"
import { useLanguage } from "@/lib/language-context"
import { CATEGORIES } from "@/types/poi"
import { Home } from "lucide-react"
import Link from "next/link"

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
  const { t, language } = useLanguage()

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

  const handleShowRoute = async (poi: POI) => {
    console.log("🗺️ Построение маршрута для:", poi.name)
    setSelectedPoi(poi)
    setLoadingRoute(true)

    try {
      // Получаем маршрут с учетом пешеходных дорог
      const route = await getRoute([56.742278, 37.191899], poi.coordinates)
      setRouteData(route)
      setShowRoute(true)

      // Показываем уведомление
      toast({
        title: "✅ Маршрут построен",
        description: `Расстояние: ${(route.distance / 1000).toFixed(1)} км, Время: ${Math.round(route.duration / 60)} мин`,
      })

      // Масштабируем карту для показа маршрута
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

        const padding = 0.002
        const extendedBounds = [
          [bounds[0][0] - padding, bounds[0][1] - padding],
          [bounds[1][0] + padding, bounds[1][1] + padding],
        ]

        mapRef.current.setBounds(extendedBounds, { checkZoomRange: true })
      }
    } catch (error) {
      console.error("❌ Ошибка построения маршрута:", error)
      toast({
        title: "Ошибка маршрута",
        description: "Не удалось построить маршрут",
        variant: "destructive",
      })
    } finally {
      setLoadingRoute(false)
    }
  }

  const handleCloseRoute = () => {
    setShowRoute(false)
    setSelectedPoi(null)
    setRouteData(null)

    if (mapRef.current) {
      mapRef.current.setCenter([56.742278, 37.191899], MAP_CONFIG.DEFAULT_ZOOM)
    }
  }

  const handleShowDetail = (poi: POI) => {
    console.log("ℹ️ Показать детали для:", poi.name)
    setSelectedPoi(poi)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  // Dynamically import components
  const RouteModal = dynamic(() => import("./route-modal"), { ssr: false })
  const POIDetail = dynamic(() => import("./poi-detail"), { ssr: false })

  // Глобальные обработчики для кнопок в балунах
  useEffect(() => {
    ;(window as any).handleRouteClick = (poiId: string) => {
      console.log("🔄 Глобальный обработчик маршрута для POI:", poiId)
      const poi = pois.find((p) => p.id === poiId)
      if (poi) {
        handleShowRoute(poi)
      }
    }
    ;(window as any).handleDetailClick = (poiId: string) => {
      console.log("🔄 Глобальный обработчик деталей для POI:", poiId)
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
    <div className="w-full h-screen relative">
      <YMaps
        query={{
          apikey: YANDEX_MAPS_API_KEY,
          lang: "ru_RU",
        }}
      >
        <Map
          defaultState={{
            center: [56.742278, 37.191899],
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
            balloonMaxWidth: 320,
            balloonMaxHeight: 400,
            balloonPanelMaxMapArea: 0,
          }}
        >
          {/* Маркер киоска */}
          <Placemark
            geometry={[56.742278, 37.191899]}
            properties={{
              iconCaption: "Вы находитесь здесь",
              balloonContentHeader: "📍 Вы находитесь здесь",
              balloonContentBody: `
                <div style="text-align: center; padding: 20px; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; margin: -8px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                    <span style="color: white; font-size: 32px;">📍</span>
                  </div>
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #dc2626;">Вы находитесь здесь</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px; color: #7f1d1d; font-weight: 600;">Информационный киоск ОИЯИ</p>
                  <p style="margin: 0; font-size: 12px; color: #991b1b;">ул. Жолио-Кюри, 6, Дубна</p>
                  <div style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                    <p style="margin: 0; font-size: 11px; color: #7f1d1d;">Выберите объект на карте для построения маршрута</p>
                  </div>
                </div>
              `,
              hintContent: "Информационный киоск - ваше местоположение",
            }}
            options={{
              preset: MAP_CONFIG.MARKER_STYLES.KIOSK,
              iconCaptionMaxWidth: "120",
            }}
          />

          {/* Маркеры POI */}
          {filteredPois.map((poi) => (
            <Placemark
              key={poi.id}
              geometry={poi.coordinates}
              properties={{
                balloonContent: createEnhancedBalloonContent(poi, poi.id),
                hintContent: `${poi.name} - ${CATEGORIES[poi.category].name}`,
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

          {/* Маршрут */}
          {showRoute && routeData && routeData.coordinates.length > 0 && (
            <Polyline
              geometry={routeData.coordinates}
              options={{
                strokeColor: "#3b82f6",
                strokeWidth: 8,
                strokeOpacity: 0.9,
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

      {/* Кнопка домой и переключатель языка */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <TouchButton
          asChild
          touchSize="lg"
          className="bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 text-gray-800 hover:bg-white hover:text-gray-900"
        >
          <Link href="/">
            <Home className="h-6 w-6 mr-2 text-blue-600" />
            <span className="font-semibold">На главную</span>
          </Link>
        </TouchButton>
        <LanguageSwitcher />
      </div>

      {/* Фильтр категорий */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-auto">
        <CategoryFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Индикатор загрузки маршрута */}
      {loadingRoute && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl z-10 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">🗺️ Построение маршрута...</p>
              <p className="text-xs text-gray-600">Расчет пешеходного пути с учетом дорог</p>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка сброса маршрута */}
      {showRoute && (
        <div className="absolute top-4 right-4 z-10">
          <TouchButton
            onClick={handleCloseRoute}
            touchSize="lg"
            className="bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 text-gray-700 hover:text-gray-900"
          >
            <span className="text-lg mr-2">←</span>
            Сбросить маршрут
          </TouchButton>
        </div>
      )}

      {/* Информация о маршруте */}
      {showRoute && routeData && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">✅ Маршрут построен</h3>
                <p className="text-sm text-gray-600">
                  Расстояние: <span className="font-medium">{(routeData.distance / 1000).toFixed(1)} км</span> • Время:{" "}
                  <span className="font-medium">{Math.round(routeData.duration / 60)} мин</span>
                </p>
              </div>
              <TouchButton
                onClick={() => setShowRoute(true)}
                touchSize="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                QR-код
              </TouchButton>
            </div>
          </div>
        </div>
      )}

      {/* Route modal с QR-кодом */}
      {showRoute && selectedPoi && (
        <RouteModal poi={selectedPoi} start={[56.742278, 37.191899]} onClose={handleCloseRoute} routeData={routeData} />
      )}

      {/* POI detail modal */}
      {showDetail && selectedPoi && (
        <POIDetail poi={selectedPoi} onClose={handleCloseDetail} onShowRoute={handleShowRoute} />
      )}
    </div>
  )
}
