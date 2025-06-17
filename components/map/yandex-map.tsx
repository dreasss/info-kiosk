"use client";

import { useState, useEffect, useRef } from "react";
import {
  YMaps,
  Map,
  Placemark,
  ZoomControl,
  TypeSelector,
  GeolocationControl,
  FullscreenControl,
  Polyline,
} from "@pbe/react-yandex-maps";
import type { POI, POICategory } from "@/types/poi";
import { fetchPOIs, fetchPOIsByCategory, getRoute } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { YANDEX_MAPS_API_KEY, MAP_CONFIG } from "@/lib/config";
import { createEnhancedBalloonContent } from "./enhanced-balloon";
import { DraggableFilter } from "./draggable-filter";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { TouchButton } from "@/components/ui/touch-button";
import { useLanguage } from "@/lib/language-context";
import { CATEGORIES } from "@/types/poi";
import { Home } from "lucide-react";
import Link from "next/link";

export default function YandexMap() {
  const [pois, setPois] = useState<POI[]>([]);
  const [filteredPois, setFilteredPois] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [activeCategory, setActiveCategory] = useState<POICategory | "all">(
    "all",
  );
  const mapRef = useRef<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Load POIs on component mount
  useEffect(() => {
    const loadPOIs = async () => {
      try {
        const data = await fetchPOIs();
        setPois(data);
        setFilteredPois(data);
      } catch (error) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить объекты на карте",
          variant: "destructive",
        });
      }
    };

    loadPOIs();
  }, [toast]);

  // Filter POIs by category
  const handleFilterChange = async (category: string) => {
    setActiveCategory(category as POICategory | "all");
    try {
      const filtered = await fetchPOIsByCategory(
        category as POICategory | "all",
      );
      setFilteredPois(filtered);
    } catch (error) {
      toast({
        title: "Ошибка фильтрации",
        description: "Не удалось отфильтровать объекты",
        variant: "destructive",
      });
    }
  };

  const handleShowRoute = async (poi: POI) => {
    console.log("🗺️ Построение маршрута для:", poi.name);
    setSelectedPoi(poi);
    setLoadingRoute(true);

    try {
      // Получаем маршрут с учетом пешеходных дорог
      const route = await getRoute([56.742278, 37.191899], poi.coordinates);
      setRouteData(route);
      setShowRoute(true);

      // Показываем уведомление
      toast({
        title: "✅ Маршрут построен",
        description: `Расстояние: ${(route.distance / 1000).toFixed(1)} км, Время: ${Math.round(route.duration / 60)} мин`,
      });

      // Масштабируем карту для показа маршрута
      if (mapRef.current && route.coordinates.length > 0) {
        const bounds = route.coordinates.reduce(
          (bounds, coord) => {
            return [
              [
                Math.min(bounds[0][0], coord[0]),
                Math.min(bounds[0][1], coord[1]),
              ],
              [
                Math.max(bounds[1][0], coord[0]),
                Math.max(bounds[1][1], coord[1]),
              ],
            ];
          },
          [
            [route.coordinates[0][0], route.coordinates[0][1]],
            [route.coordinates[0][0], route.coordinates[0][1]],
          ],
        );

        const padding = 0.002;
        const extendedBounds = [
          [bounds[0][0] - padding, bounds[0][1] - padding],
          [bounds[1][0] + padding, bounds[1][1] + padding],
        ];

        mapRef.current.setBounds(extendedBounds, { checkZoomRange: true });
      }
    } catch (error) {
      console.error("❌ Ошибка построения маршрута:", error);
      toast({
        title: "Ошибка маршрута",
        description: "Не удалось построить маршрут",
        variant: "destructive",
      });
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleCloseRoute = () => {
    setShowRoute(false);
    setSelectedPoi(null);
    setRouteData(null);

    if (mapRef.current) {
      mapRef.current.setCenter([56.742278, 37.191899], MAP_CONFIG.DEFAULT_ZOOM);
    }
  };

  const handleShowDetail = (poi: POI) => {
    console.log("ℹ️ Показать детали для:", poi.name);
    setSelectedPoi(poi);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  // Dynamically import components
  const RouteModal = dynamic(() => import("./route-modal"), { ssr: false });
  const POIDetail = dynamic(() => import("./poi-detail"), { ssr: false });

  // Глобальные обработчики для кнопок в балунах
  useEffect(() => {
    (window as any).handleRouteClick = (poiId: string) => {
      console.log("🔄 Глобальный обработчик маршрута для POI:", poiId);
      const poi = pois.find((p) => p.id === poiId);
      if (poi) {
        handleShowRoute(poi);
      }
    };
    (window as any).handleDetailClick = (poiId: string) => {
      console.log("🔄 Глобальный обработчик деталей для POI:", poiId);
      const poi = pois.find((p) => p.id === poiId);
      if (poi) {
        handleShowDetail(poi);
      }
    };

    return () => {
      delete (window as any).handleRouteClick;
      delete (window as any).handleDetailClick;
    };
  }, [pois]);

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
              mapRef.current = ref;
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
                <div style="
                  text-align: center;
                  padding: 24px;
                  font-family: 'Inter', sans-serif;
                  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
                  border-radius: 20px;
                  margin: -8px;
                  position: relative;
                  overflow: hidden;
                  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
                ">
                  <!-- Декоративная верхняя полоска -->
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
                  "></div>

                  <!-- Современный значок -->
                  <div style="
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 15px 30px rgba(220, 38, 38, 0.4), inset 0 0 0 3px rgba(255,255,255,0.3);
                    position: relative;
                    overflow: hidden;
                  ">
                    <!-- Анимированный блик -->
                    <div style="
                      position: absolute;
                      top: -50%;
                      left: -50%;
                      width: 200%;
                      height: 200%;
                      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                      animation: shine 3s infinite;
                    "></div>
                    <span style="color: white; font-size: 40px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 2;">📍</span>
                  </div>

                  <!-- Заголовок с градиентом -->
                  <h3 style="
                    margin: 0 0 12px 0;
                    font-size: 22px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
                  ">Вы находитесь здесь</h3>

                  <!-- Подзаголовок -->
                  <p style="
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    color: #7f1d1d;
                    font-weight: 700;
                    background: rgba(255,255,255,0.6);
                    padding: 8px 16px;
                    border-radius: 12px;
                    display: inline-block;
                  ">Информационный киоск ОИЯИ</p>

                  <!-- Адрес -->
                  <p style="
                    margin: 0 0 16px 0;
                    font-size: 13px;
                    color: #991b1b;
                    font-weight: 600;
                  ">ул. Жолио-Кюри, 6, Дубна</p>

                  <!-- Информационный блок -->
                  <div style="
                    margin-top: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9));
                    border-radius: 16px;
                    border: 2px solid rgba(220, 38, 38, 0.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  ">
                    <div style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      margin-bottom: 8px;
                    ">
                      <span style="
                        background: #dc262620;
                        padding: 6px;
                        border-radius: 8px;
                        margin-right: 8px;
                        font-size: 16px;
                      ">🗺️</span>
                      <span style="
                        font-size: 12px;
                        color: #7f1d1d;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      ">Навигация</span>
                    </div>
                    <p style="
                      margin: 0;
                      font-size: 12px;
                      color: #7f1d1d;
                      line-height: 1.4;
                      font-weight: 600;
                    ">Выберите объект на карте для построения маршрута</p>
                  </div>

                  <!-- Декоративные точки -->
                  <div style="
                    margin-top: 16px;
                    display: flex;
                    justify-content: center;
                    gap: 4px;
                  ">
                    <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%; opacity: 0.6;"></div>
                    <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%; opacity: 0.8;"></div>
                    <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%;"></div>
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
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <TouchButton
          asChild
          touchSize="lg"
          className="group relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white shadow-2xl hover:shadow-3xl border-0 backdrop-blur-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
        >
          <Link href="/">
            {/* Анимированный фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            {/* Декоративные элементы */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/20 rounded-full animate-ping"></div>
            </div>

            {/* Основной контент */}
            <div className="relative flex items-center px-6 py-3">
              <div className="mr-3 p-2 bg-white/15 rounded-xl backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                <Home className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold text-white drop-shadow-lg group-hover:text-blue-100 transition-colors duration-300"
                  suppressHydrationWarning={true}
                >
                  На главную
                </span>
                <span className="text-xs text-blue-200 font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  Вернуться к меню
                </span>
              </div>
            </div>
          </Link>
        </TouchButton>
        <LanguageSwitcher />
      </div>

      {/* Фильтр категорий (перемещаемый) */}
      <DraggableFilter onFilterChange={handleFilterChange} />

      {/* Индикатор загрузки маршрута */}
      {loadingRoute && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl z-10 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                🗺️ Построение маршрута...
              </p>
              <p className="text-xs text-gray-600">
                Расчет пешеходного пути с учетом дорог
              </p>
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
            <span className="text-lg mr-2" suppressHydrationWarning={true}>
              ←
            </span>
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
                <h3 className="font-semibold text-gray-800">
                  ✅ Маршрут построен
                </h3>
                <p className="text-sm text-gray-600">
                  Расстояние:{" "}
                  <span className="font-medium" suppressHydrationWarning={true}>
                    {(routeData.distance / 1000).toFixed(1)} км
                  </span>{" "}
                  • Время:{" "}
                  <span className="font-medium" suppressHydrationWarning={true}>
                    {Math.round(routeData.duration / 60)} мин
                  </span>
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
        <RouteModal
          poi={selectedPoi}
          start={[56.742278, 37.191899]}
          onClose={handleCloseRoute}
          routeData={routeData}
        />
      )}

      {/* POI detail modal */}
      {showDetail && selectedPoi && (
        <POIDetail
          poi={selectedPoi}
          onClose={handleCloseDetail}
          onShowRoute={handleShowRoute}
        />
      )}
    </div>
  );
}
