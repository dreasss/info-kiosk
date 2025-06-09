"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { POI } from "@/types/poi"
import PointOfInterest from "./point-of-interest"
import RouteDisplay from "./route-display"
import { fetchPOIs } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import MapboxController from "./mapbox-controller"
// Добавим импорт StyleSwitcher и утилит Mapbox
import StyleSwitcher from "./style-switcher"
import { getMapboxTileUrl } from "@/lib/mapbox-utils"

// Mapbox token - в реальном приложении следует хранить в переменных окружения
const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

// Fix for default marker icons in Leaflet with Next.js
const createCustomIcon = (iconUrl: string, iconSize: [number, number]) => {
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]],
  })
}

// Kiosk location (Joliot-Curie 20, Dubna)
const KIOSK_LOCATION: [number, number] = [56.7417, 37.189]
const DEFAULT_ZOOM = 16

// Component to set view and handle map events
// function MapController() {
//   const map = useMap()

//   useEffect(() => {
//     map.setView(KIOSK_LOCATION, DEFAULT_ZOOM)
//   }, [map])

//   return null
// }

export default function Map() {
  const [pois, setPois] = useState<POI[]>([])
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [showRoute, setShowRoute] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const { toast } = useToast()

  // Load POIs on component mount
  useEffect(() => {
    const loadPOIs = async () => {
      try {
        const data = await fetchPOIs()
        setPois(data)
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

  const handleShowRoute = (poi: POI) => {
    setSelectedPoi(poi)
    setShowRoute(true)
  }

  const handleCloseRoute = () => {
    setShowRoute(false)
  }

  // Dynamically import the RouteModal component to avoid SSR issues
  const RouteModal = dynamic(() => import("./route-modal"), {
    ssr: false,
  })

  // Dynamically import the POIDetail component
  const POIDetail = dynamic(() => import("./poi-detail"), {
    ssr: false,
  })

  const [showDetail, setShowDetail] = useState(false)

  const handleShowDetail = (poi: POI) => {
    setSelectedPoi(poi)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  // Create custom icons
  const kioskIcon = createCustomIcon("/images/kiosk-marker.png", [40, 40])
  const poiIcon = createCustomIcon("/images/poi-marker.png", [30, 30])

  return (
    <div className="w-full h-screen relative" style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        className="w-full h-full z-0"
        center={KIOSK_LOCATION}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        whenReady={(map) => {
          mapRef.current = map.target
          // Принудительно обновляем размер карты после монтирования
          setTimeout(() => {
            map.target.invalidateSize()
          }, 100)
        }}
      >
        {/* Заменим TileLayer на использование утилиты getMapboxTileUrl */}
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={getMapboxTileUrl()}
          tileSize={512}
          zoomOffset={-1}
        />

        {/* Kiosk marker */}
        <Marker position={KIOSK_LOCATION} icon={kioskIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Вы здесь</h3>
              <p>Информационный киоск</p>
            </div>
          </Popup>
        </Marker>

        {/* POI markers */}
        {pois.map((poi) => (
          <PointOfInterest
            key={poi.id}
            poi={poi}
            icon={poiIcon}
            onShowRoute={handleShowRoute}
            onShowDetail={handleShowDetail}
          />
        ))}

        {/* Route display when a route is selected */}
        {showRoute && selectedPoi && <RouteDisplay start={KIOSK_LOCATION} end={selectedPoi.coordinates} />}

        <MapboxController center={KIOSK_LOCATION} zoom={DEFAULT_ZOOM} />
        {/* Добавим компонент StyleSwitcher перед закрывающим тегом MapContainer */}
        <StyleSwitcher />
      </MapContainer>

      {/* Route modal */}
      {showRoute && selectedPoi && <RouteModal poi={selectedPoi} start={KIOSK_LOCATION} onClose={handleCloseRoute} />}

      {/* POI detail modal */}
      {showDetail && selectedPoi && <POIDetail poi={selectedPoi} onClose={handleCloseDetail} />}
    </div>
  )
}
