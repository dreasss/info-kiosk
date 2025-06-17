"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, ExternalLink } from "lucide-react";
import type { NewsItem } from "@/types/news";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";

interface NewsCarouselProps {
  news: NewsItem[];
}

export function NewsCarousel({ news }: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { language } = useLanguage();

  // Ensure we only render language-dependent content after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Автоматическое перекл��чение слайдов
  useEffect(() => {
    if (news.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000); // Переключение каждые 5 секунд

    return () => clearInterval(interval);
  }, [news.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      isClient && language === "en" ? "en-US" : "ru-RU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  if (news.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {isClient && language === "en"
            ? "No news to display"
            : "Нет новостей для отображения"}
        </p>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="relative">
      <Card className="overflow-hidden h-80">
        <CardContent className="p-0 h-full">
          <div className="grid md:grid-cols-3 gap-0 h-full">
            {/* Изображение */}
            <div className="relative h-48 md:h-auto">
              <Image
                src={
                  currentNews.image || "/placeholder.svg?height=200&width=300"
                }
                alt={currentNews.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(currentNews.date)}
                </div>
              </div>
            </div>

            {/* Контент */}
            <div className="md:col-span-2 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {currentNews.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {currentNews.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Индикаторы */}
                  {news.length > 1 && (
                    <div className="flex gap-1">
                      {news.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentIndex
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentNews.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={currentNews.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {isClient && language === "en" ? "Read" : "Читать"}
                      </a>
                    </Button>
                  )}

                  {/* Кнопки навигации */}
                  {news.length > 1 && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevious}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNext}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Счетчик новостей */}
      {news.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {news.length}
        </div>
      )}
    </div>
  );
}
