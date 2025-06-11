"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { TouchButton } from "@/components/ui/touch-button"
import { ClockDate } from "@/components/ui/clock-date"
import { RssTicker } from "@/components/ui/rss-ticker"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { NewsCarousel } from "@/components/ui/news-carousel"
import { Map, ImageIcon, Newspaper, Info, Building2, Settings, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { fetchNews } from "@/lib/api"
import type { NewsItem } from "@/types/news"

export default function HomePage() {
  const { language } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews()
        setNews(data.slice(0, 5)) // Берем только 5 последних новостей
      } catch (error) {
        console.error("Error loading news:", error)
      }
    }

    loadNews()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Шапка с более мягким градиентом */}
      <header className="bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 shadow-lg relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Логотип и название */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
                <Image
                  src="/images/jinr-logo.png"
                  alt="JINR Logo"
                  width={60}
                  height={60}
                  className="relative rounded-full border-2 border-white/30 shadow-lg"
                />
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {language === "ru"
                    ? "Объединенный Институт Ядерных Исследований"
                    : "Joint Institute for Nuclear Research"}
                </h1>
              </div>
            </div>

            {/* Часы и дата по центру */}
            <div className="hidden md:flex flex-1 justify-center">
              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-md"
                style={{
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <ClockDate />
              </div>
            </div>

            {/* Переключатель языка и кнопка админки */}
            <div className="flex items-center gap-3">
              <div
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                style={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <LanguageSwitcher />
              </div>

              <Link href="/admin">
                <div
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  style={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Settings className="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Бегущая строка новостей */}
      <RssTicker />

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Приветствие */}
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent mb-2">
              {language === "ru" ? "Добро пожаловать" : "Welcome"}
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              {language === "ru" ? "Интерактивная информационная система ОИЯИ" : "JINR Interactive Information System"}
            </p>
          </div>

          {/* Сетка навигации */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <TouchButton
              href="/map"
              icon={Map}
              title={language === "ru" ? "Карта" : "Map"}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />

            <TouchButton
              href="/gallery"
              icon={ImageIcon}
              title={language === "ru" ? "Галерея" : "Gallery"}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />

            <TouchButton
              href="/news"
              icon={Newspaper}
              title={language === "ru" ? "Новости" : "News"}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />

            <TouchButton
              href="/infrastructure"
              icon={Building2}
              title={language === "ru" ? "Инфраструктура" : "Infrastructure"}
              className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />

            <TouchButton
              href="/events"
              icon={Calendar}
              title={language === "ru" ? "События" : "Events"}
              className="bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />

            <TouchButton
              href="/about"
              icon={Info}
              title={language === "ru" ? "О ОИЯИ" : "About"}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white h-28 md:h-32 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              touchSize="lg"
            />
          </div>

          {/* Карусель новостей */}
          <div className="flex-1 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden h-full">
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Newspaper className="h-5 w-5 mr-2 text-blue-500" />
                  {language === "ru" ? "Последние новости" : "Latest News"}
                </h3>
                <NewsCarousel news={news} />
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Футер с контактной информацией */}
      <footer className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center">
            <span className="font-medium mr-2">© 2025 ОИЯИ</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center">
              <span className="opacity-70 mr-1">📍</span>
              <span>{language === "ru" ? "г. Дубна, Московская область" : "Dubna, Moscow Region"}</span>
            </div>
            <div className="flex items-center">
              <span className="opacity-70 mr-1">📞</span>
              <span>+7 (496) 216-50-59</span>
            </div>
            <div className="flex items-center">
              <span className="opacity-70 mr-1">✉️</span>
              <span>post@jinr.ru</span>
            </div>
            <div className="flex items-center">
              <span className="opacity-70 mr-1">🌐</span>
              <span>www.jinr.ru</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
