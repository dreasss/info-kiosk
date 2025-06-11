"use client"

import { useState, useEffect } from "react"
import type { POI } from "@/types/poi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { generateQRCode } from "@/lib/qr-code"
import { Clock, MapIcon, Download, Route, MapPin, Smartphone } from "lucide-react"
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

        // Генерируем QR коды для маршрутов
        const googleMapsUrl = `https://www.google.com/maps/dir/${start[0]},${start[1]}/${poi.coordinates[0]},${poi.coordinates[1]}/@${poi.coordinates[0]},${poi.coordinates[1]},15z/data=!3m1!4b1!4m2!4m1!3e2`
        const yandexMapsUrl = `https://yandex.ru/maps/?rtext=${start[0]},${start[1]}~${poi.coordinates[0]},${poi.coordinates[1]}&rtt=pd&z=15`

        const [googleQRCode, yandexQRCode] = await Promise.all([
          generateQRCode(googleMapsUrl),
          generateQRCode(yandexMapsUrl),
        ])

        setGoogleQR(googleQRCode)
        setYandexQR(yandexQRCode)
      } catch (error) {
        console.error("Error generating QR codes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQRCodes()
  }, [poi, start])

  const formatDistance = (meters: number) => {
    return meters < 1000 ? `${Math.round(meters)} м` : `${(meters / 1000).toFixed(1)} км`
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
    link.download = `route-to-${poi.name.replace(/\s+/g, "-")}-${mapType}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openInMaps = (mapType: "yandex" | "google") => {
    const urls = {
      yandex: `https://yandex.ru/maps/?rtext=${start[0]},${start[1]}~${poi.coordinates[0]},${poi.coordinates[1]}&rtt=pd&z=15`,
      google: `https://www.google.com/maps/dir/${start[0]},${start[1]}/${poi.coordinates[0]},${poi.coordinates[1]}/@${poi.coordinates[0]},${poi.coordinates[1]},15z/data=!3m1!4b1!4m2!4m1!3e2`,
    }
    window.open(urls[mapType], "_blank")
  }

  const category = CATEGORIES[poi.category]

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Route className="h-6 w-6" style={{ color: category.color }} />
            <span>Маршрут до объекта</span>
            <span className="font-bold" style={{ color: category.color }}>
              {poi.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <div className="ml-4">
              <p className="text-lg font-semibold">Генерация QR-кодов...</p>
              <p className="text-sm text-gray-600">Подготовка маршрутов для навигации</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Информация об объекте */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-lg">
                <Image
                  src={poi.images[0] || "/placeholder.svg?height=80&width=80"}
                  alt={poi.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{poi.name}</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {poi.address}
                </p>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mt-2"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </div>
              </div>
            </div>

            {/* Детали маршрута */}
            {routeData && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <MapIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Расстояние</p>
                      <p className="text-2xl font-bold text-green-700">{formatDistance(routeData.distance)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900">Время пешком</p>
                      <p className="text-2xl font-bold text-orange-700">{formatDuration(routeData.duration)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR коды для навигации */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">Открыть маршрут на смартфоне</h3>
              </div>

              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${
                    activeTab === "yandex"
                      ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("yandex")}
                >
                  Яндекс.Карты
                </button>
                <button
                  className={`flex-1 py-3 text-center font-semibold transition-colors ${
                    activeTab === "google"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("google")}
                >
                  Google Maps
                </button>
              </div>

              {activeTab === "yandex" && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-xl border-2 border-red-200 inline-block">
                    <div className="relative w-64 h-64 mx-auto">
                      <Image
                        src={yandexQR || "/placeholder.svg"}
                        alt="Yandex Maps QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800 font-medium mb-2">📱 Отсканируйте QR-код камерой телефона</p>
                    <p className="text-xs text-red-600">
                      Маршрут автоматически откроется в Яндекс.Картах на вашем смартфоне
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => downloadQR(yandexQR, "yandex")}
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Скачать QR
                    </Button>
                    <Button onClick={() => openInMaps("yandex")} className="flex-1 bg-red-600 hover:bg-red-700">
                      Открыть в Яндекс.Картах
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "google" && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200 inline-block">
                    <div className="relative w-64 h-64 mx-auto">
                      <Image
                        src={googleQR || "/placeholder.svg"}
                        alt="Google Maps QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-2">📱 Отсканируйте QR-код камерой телефона</p>
                    <p className="text-xs text-blue-600">
                      Маршрут автоматически откроется в Google Maps на вашем смартфоне
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => downloadQR(googleQR, "google")}
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Скачать QR
                    </Button>
                    <Button onClick={() => openInMaps("google")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Открыть в Google Maps
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full">
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
