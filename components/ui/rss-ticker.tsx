"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RSSTickerProps {
  className?: string
}

interface RSSItem {
  title: string
  link: string
  pubDate: string
}

export function RSSTicker({ className }: RSSTickerProps) {
  const [news, setNews] = useState<RSSItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        // В реальном приложении здесь был бы запрос к RSS API
        // Для демонстрации используем мок-данные в стиле Naked Science
        const mockNews: RSSItem[] = [
          {
            title: "Ученые обнаружили новый тип квантовых частиц в лабораторных условиях",
            link: "#",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Прорыв в области термоядерного синтеза: достигнута рекордная температура",
            link: "#",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Исследователи создали новый материал с уникальными свойствами",
            link: "#",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Открытие нового механизма работы ДНК может изменить медицину",
            link: "#",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Физики подтвердили существование экзотической формы материи",
            link: "#",
            pubDate: new Date().toISOString(),
          },
        ]

        setNews(mockNews)
      } catch (error) {
        console.error("Error fetching RSS feed:", error)
        setNews([
          {
            title: "Добро пожаловать в информационную систему ОИЯИ",
            link: "#",
            pubDate: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRSSFeed()
  }, [])

  if (loading) {
    return (
      <div className={cn("bg-gradient-to-r from-blue-700 to-blue-800 text-white py-3 overflow-hidden", className)}>
        <div className="flex items-center justify-center h-8">
          <div className="animate-pulse bg-white/20 h-4 w-48 rounded"></div>
        </div>
      </div>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <div
      className={cn("bg-gradient-to-r from-blue-700 to-blue-800 text-white py-3 overflow-hidden relative", className)}
    >
      <div className="flex items-center h-8">
        <div className="font-bold mr-6 px-4 whitespace-nowrap bg-blue-900 rounded-r-full flex items-center">
          <span className="text-yellow-300 mr-2">📡</span>
          НОВОСТИ НАУКИ
        </div>
        <div className="ticker-container overflow-hidden relative w-full">
          <div className="ticker-content whitespace-nowrap animate-scroll">
            {news.concat(news).map((item, index) => (
              <span key={index} className="mx-8 font-medium hover:text-blue-200 cursor-pointer transition-colors">
                <span className="text-yellow-300 mr-2">🔬</span>
                {item.title}
                <span className="mx-4 text-blue-300">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
