"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

interface MapboxControllerProps {
  mapStyle?: string
  center: [number, number]
  zoom: number
}

export default function MapboxController({ mapStyle = "streets-v11", center, zoom }: MapboxControllerProps) {
  const map = useMap()

  useEffect(() => {
    // Установка начального вида карты
    map.setView(center, zoom)

    // Добавление элементов управления Mapbox
    L.control.scale({ imperial: false }).addTo(map)

    // Обработчик изменения размера окна для корректного отображения карты
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener("resize", handleResize)

    // Принудительное обновление размера карты после монтирования
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [map, center, zoom, mapStyle])

  return null
}
