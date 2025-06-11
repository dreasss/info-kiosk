"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TouchButton } from "@/components/ui/touch-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { fetchNews } from "@/lib/api"
import type { NewsItem } from "@/types/news"
import { Home, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews()
        setNews(data)
      } catch (error) {
        console.error("Error loading news:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t.news}</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <TouchButton asChild touchSize="lg" className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              {t.home}
            </Link>
          </TouchButton>
        </div>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <TouchButton key={item.id} asChild className="h-auto p-0">
              <Link href={`/news/${item.id}`}>
                <Card className="w-full h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={item.image || "/placeholder.svg?height=200&width=300"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.date).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">{item.content}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      {t.readMore}
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TouchButton>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-2">{t.newsNotFound}</h3>
          <p className="text-gray-500 mb-6">
            {language === "ru" ? "В настоящее время новости отсутствуют" : "No news available at the moment"}
          </p>
          <TouchButton asChild>
            <Link href="/">{t.home}</Link>
          </TouchButton>
        </div>
      )}
    </div>
  )
}
