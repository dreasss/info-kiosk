"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { NewsItem } from "@/types/news"

interface NewsCarouselProps {
  news: NewsItem[]
}

export function NewsCarousel({ news }: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { language } = useLanguage()

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (news.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? news.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length)
  }

  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
        <p className="text-gray-500">{language === "ru" ? "Новости не найдены" : "No news found"}</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {news.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative h-40 md:h-full rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg?height=200&width=300"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex flex-col h-full">
                        <h4 className="text-lg font-bold mb-2 line-clamp-2">{item.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{formatDate(item.date)}</p>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.content}</p>
                        <div className="mt-auto">
                          <Link href={`/news/${item.id}`}>
                            <Button variant="outline" size="sm">
                              {language === "ru" ? "Подробнее" : "Read more"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {news.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-2">
            {news.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-blue-500 w-4" : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
