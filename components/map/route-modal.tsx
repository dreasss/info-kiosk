"use client"

import { useState, useEffect } from "react"
import type { POI } from "@/types/poi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { generateQRCode } from "@/lib/qr-code"
import { Clock, MapIcon, Download, Route, MapPin } from "lucide-react"
import Image from "next/image"
import { CATEGORIES } from "@/types/poi"

interface RouteModalProps {
  poi: POI
  start: [number, number]
  onClose: () => void
  routeData?: any
}

export default function RouteModal({ poi, start, onClose, routeData }: RouteModalProps) {
  const [googleQR, setGoogleQR] = useState<string>("")
  const [yandexQR, setYandexQR] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"yandex" | "google">("yandex")

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true)

        // Generate QR codes
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${poi.coordinates[0]},${poi.coordinates[1]}&travelmode=walking`
        const yandexMapsUrl = `https://yandex.ru/maps/?rtext=${start[0]},${start[1]}~${poi.coordinates[0]},${poi.coordinates[1]}&rtt=pd`

        const googleQR = await generateQRCode(googleMapsUrl)
        const yandexQR = await generateQRCode(yandexMapsUrl)

        setGoogleQR(googleQR)
        setYandexQR(yandexQR)
      } catch (error) {
        console.error("Error generating QR codes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQRCodes()
  }, [poi, start])

  const formatDistance = (meters: number) => {
    return meters < 1000 ? `${meters.toFixed(0)} м` : `${(meters / 1000).toFixed(1)} км`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} мин`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} ч ${remainingMinutes} мин`
  }

  const downloadQR = (qrData: string, mapType: string) => {
    const link = document.createElement("a")
    link.href = qrData
    link.download = `${mapType}-route-to-${poi.name.replace(/\s+/g, "-")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openInMaps = (mapType: "yandex" | "google") => {
    const urls = {
      yandex: `https://yandex.ru/maps/?rtext=${start[0]},${start[1]}~${poi.coordinates[0]},${poi.coordinates[1]}&rtt=pd`,
      google: `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${poi.coordinates[0]},${poi.coordinates[1]}&travelmode=walking`,
    }
    window.open(urls[mapType], "_blank")
  }

  const category = CATEGORIES[poi.category]

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" style={{ color: category.color }} />
            <span>Маршрут до</span>
            <span className="font-semibold" style={{ color: category.color }}>
              {poi.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {routeData && (
              <div className="py-4">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 mr-4 border-2 border-gray-200">
                    <Image
                      src={poi.images[0] || "/placeholder.svg?height=64&width=64"}
                      alt={poi.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{poi.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {poi.address}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Расстояние: {formatDistance(routeData.distance)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Время пешком: {formatDuration(routeData.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Маршрут проложен с учетом пешеходных дорожек</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-center mb-4">Открыть маршрут в навигаторе</h3>

                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      className={`flex-1 py-2 text-center font-medium text-sm transition-colors ${
                        activeTab === "yandex"
                          ? "text-red-500 border-b-2 border-red-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("yandex")}
                    >
                      Яндекс.Карты
                    </button>
                    <button
                      className={`flex-1 py-2 text-center font-medium text-sm transition-colors ${
                        activeTab === "google"
                          ? "text-blue-500 border-b-2 border-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("google")}
                    >
                      Google Maps
                    </button>
                  </div>

                  {activeTab === "yandex" && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 mb-4">
                        <Image
                          src={yandexQR || "/placeholder.svg"}
                          alt="Yandex Maps QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        Отсканируйте QR-код камерой телефона или нажмите кнопку для открытия маршрута в Яндекс.Картах
                      </p>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadQR(yandexQR, "yandex")}
                          className="flex-1"
                        >
                          <Download className="mr-1 h-4 w-4" /> Скачать QR-код
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openInMaps("yandex")}
                          className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                          Открыть в Яндекс.Картах
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "google" && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 mb-4">
                        <Image
                          src={googleQR || "/placeholder.svg"}
                          alt="Google Maps QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        Отсканируйте QR-код камерой телефона или нажмите кнопку для открытия маршрута в Google Maps
                      </p>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadQR(googleQR, "google")}
                          className="flex-1"
                        >
                          <Download className="mr-1 h-4 w-4" /> Скачать QR-код
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openInMaps("google")}
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                        >
                          Открыть в Google Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
