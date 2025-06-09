"use client"

import { useEffect, useState } from "react"
import { Polyline, useMap } from "react-leaflet"
import { getRoute } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import L from "leaflet"

interface RouteDisplayProps {
  start: [number, number]
  end: [number, number]
}

export default function RouteDisplay({ start, end }: RouteDisplayProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
  const map = useMap()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const route = await getRoute(start, end)
        setRouteCoordinates(route.coordinates)

        // Fit map to show the entire route
        if (route.coordinates.length > 0) {
          const bounds = route.coordinates.reduce(
            (bounds, coord) => bounds.extend([coord[0], coord[1]]),
            L.latLngBounds([start], [end]),
          )
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (error) {
        toast({
          title: "Ошибка маршрута",
          description: "Не удалось построить маршрут",
          variant: "destructive",
        })
      }
    }

    fetchRoute()
  }, [start, end, map, toast])

  if (routeCoordinates.length === 0) {
    return null
  }

  return <Polyline positions={routeCoordinates} color="#3b82f6" weight={5} opacity={0.7} />
}
