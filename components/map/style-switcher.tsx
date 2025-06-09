"use client"

import { useState } from "react"
import { useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { MAPBOX_STYLES, getMapboxTileUrl } from "@/lib/mapbox-utils"
import { Map, Mountain, Sun, Moon, Satellite, Navigation } from "lucide-react"
import L from "leaflet"

export default function StyleSwitcher() {
  const map = useMap()
  const [activeStyle, setActiveStyle] = useState(MAPBOX_STYLES.streets)

  const changeMapStyle = (style: string) => {
    // Найти и заменить текущий слой тайлов
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Добавить новый слой с выбранным стилем
    L.tileLayer(getMapboxTileUrl(style), {
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map)

    setActiveStyle(style)
  }

  return (
    <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-md shadow-md">
      <div className="flex flex-col gap-2">
        <Button
          variant={activeStyle === MAPBOX_STYLES.streets ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.streets)}
          title="Улицы"
        >
          <Map className="h-4 w-4" />
        </Button>
        <Button
          variant={activeStyle === MAPBOX_STYLES.outdoors ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.outdoors)}
          title="Природа"
        >
          <Mountain className="h-4 w-4" />
        </Button>
        <Button
          variant={activeStyle === MAPBOX_STYLES.light ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.light)}
          title="Светлая тема"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={activeStyle === MAPBOX_STYLES.dark ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.dark)}
          title="Темная тема"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={activeStyle === MAPBOX_STYLES.satellite ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.satellite)}
          title="Спутник"
        >
          <Satellite className="h-4 w-4" />
        </Button>
        <Button
          variant={activeStyle === MAPBOX_STYLES.navigationDay ? "default" : "outline"}
          size="icon"
          onClick={() => changeMapStyle(MAPBOX_STYLES.navigationDay)}
          title="Навигация"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
