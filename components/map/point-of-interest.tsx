"use client"

import { Marker, Popup } from "react-leaflet"
import type { POI } from "@/types/poi"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MapPin, Info } from "lucide-react"
import type L from "leaflet"

interface PointOfInterestProps {
  poi: POI
  icon: L.Icon
  onShowRoute: (poi: POI) => void
  onShowDetail: (poi: POI) => void
}

export default function PointOfInterest({ poi, icon, onShowRoute, onShowDetail }: PointOfInterestProps) {
  return (
    <Marker position={poi.coordinates} icon={icon}>
      <Popup>
        <div className="w-64 flex flex-col gap-2">
          <h3 className="font-bold text-lg">{poi.name}</h3>
          <div className="relative w-full h-32 mb-2">
            <Image src={poi.images[0] || "/placeholder.svg"} alt={poi.name} fill className="object-cover rounded-md" />
          </div>
          <p className="text-sm mb-2">{poi.shortDescription}</p>
          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onShowRoute(poi)
              }}
              className="flex-1"
            >
              <MapPin className="mr-1 h-4 w-4" /> Маршрут
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onShowDetail(poi)
              }}
              className="flex-1"
            >
              <Info className="mr-1 h-4 w-4" /> Подробнее
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
