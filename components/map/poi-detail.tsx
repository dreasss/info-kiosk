"use client"

import type { POI } from "@/types/poi"
import { CATEGORIES } from "@/types/poi"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MapPin, Route, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface POIDetailProps {
  poi: POI
  onClose: () => void
  onShowRoute?: (poi: POI) => void
}

export default function POIDetail({ poi, onClose, onShowRoute }: POIDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const category = CATEGORIES[poi.category]

  const handleShowRoute = () => {
    if (onShowRoute) {
      onShowRoute(poi)
    }
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">{poi.name}</DialogTitle>
                <div
                  className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mt-1"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Image gallery */}
          {poi.images && poi.images.length > 0 && (
            <div className="mb-6">
              <Carousel className="w-full">
                <CarouselContent>
                  {poi.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-64 md:h-80 lg:h-96">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${poi.name} - изображение ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {poi.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>

              {/* Image indicators */}
              {poi.images.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {poi.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        index === currentImageIndex ? "bg-blue-600 w-6" : "bg-gray-300",
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Адрес</h4>
              <p className="text-gray-600">{poi.address}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">Описание</h4>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p>{poi.fullDescription}</p>
            </div>
          </div>

          {/* Additional info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Категория объекта</h5>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                <span className="text-blue-800">{category.name}</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Доступность</h5>
              <p className="text-green-800 text-sm">Объект доступен для посещения в рамках экскурсионных программ</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Закрыть
            </Button>
            {onShowRoute && (
              <Button
                onClick={handleShowRoute}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
                style={{ backgroundColor: category.color }}
              >
                <Route className="h-4 w-4 mr-2" />
                Построить маршрут
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
