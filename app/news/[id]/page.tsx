"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TouchButton } from "@/components/ui/touch-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { fetchNewsById } from "@/lib/api"
import type { NewsItem } from "@/types/news"
import { Home, Calendar, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NewsDetailPage() {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { t, language } = useLanguage()

  useEffect(() => {
    const loadNews = async () => {
      try {
        const id = params.id as string
        const data = await fetchNewsById(id)
        setNewsItem(data)
      } catch (error) {
        console.error("Error loading news:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [params.id])

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

  if (!newsItem) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-2">{t.newsNotFound}</h3>
          <TouchButton asChild className="mt-4">
            <Link href="/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "ru" ? "Назад к новостям" : "Back to news"}
            </Link>
          </TouchButton>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <TouchButton asChild variant="outline">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "ru" ? "Назад к новостям" : "Back to news"}
          </Link>
        </TouchButton>
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

      <article className="max-w-4xl mx-auto">
        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={newsItem.image || "/placeholder.svg?height=400&width=800"}
            alt={newsItem.title}
            fill
            className="object-cover"
          />
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{newsItem.title}</h1>
          <div className="flex items-center text-gray-500 mb-4">
            <Calendar className="h-5 w-5 mr-2" />
            <time dateTime={newsItem.date}>
              {new Date(newsItem.date).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{newsItem.content}</div>
        </div>

        {newsItem.url && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <TouchButton asChild>
              <Link href={newsItem.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === "ru" ? "Читать полностью" : "Read full article"}
              </Link>
            </TouchButton>
          </div>
        )}
      </article>
    </div>
  )
}
