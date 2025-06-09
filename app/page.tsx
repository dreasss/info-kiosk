"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchNews, fetchSettings } from "@/lib/api"
import type { NewsItem } from "@/types/news"
import type { SystemSettings } from "@/types/settings"
import { Map, Building, Camera, Info, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, settingsData] = await Promise.all([fetchNews(), fetchSettings()])
        setNews(newsData)
        setSettings(settingsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Автоматическая смена новостей каждую минуту
  useEffect(() => {
    if (news.length === 0) return

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length)
    }, 60000) // 60 секунд

    return () => clearInterval(interval)
  }, [news.length])

  const navigationItems = [
    {
      title: "Интерактивная карта",
      description: "Навигация по территории ОИЯИ",
      icon: Map,
      href: "/map",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "О ОИЯИ",
      description: "История и информация об институте",
      icon: Info,
      href: "/about",
      color: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Инфраструктура",
      description: "Объекты и сооружения института",
      icon: Building,
      href: "/infrastructure",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Фото и Видео",
      description: "Галерея изображений и видеоматериалов",
      icon: Camera,
      href: "/gallery",
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  const currentNews = news[currentNewsIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Image
                  src={settings?.organizationInfo.logo || "/placeholder.svg?height=48&width=48"}
                  alt="ОИЯИ"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{settings?.organizationInfo.name || "ОИЯИ"}</h1>
                <p className="text-sm text-gray-600">
                  {settings?.organizationInfo.fullName || "Объединенный институт ядерных исследований"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Navigation Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Добро пожаловать в информационную систему ОИЯИ
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.href}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 overflow-hidden"
                    onClick={() => router.push(item.href)}
                  >
                    <CardContent className="p-0">
                      <div className={cn("h-32 bg-gradient-to-br", item.color, "relative overflow-hidden")}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-4 right-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.iconBg)}>
                            <Icon className={cn("h-6 w-6", item.iconColor)} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                          <p className="text-sm opacity-90">{item.description}</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* News Section */}
          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Новости</h3>
                  <div className="flex space-x-1">
                    {news.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          index === currentNewsIndex ? "bg-blue-600 w-6" : "bg-gray-300",
                        )}
                        onClick={() => setCurrentNewsIndex(index)}
                      />
                    ))}
                  </div>
                </div>

                {currentNews && (
                  <div className="space-y-4">
                    {currentNews.image && (
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={currentNews.image || "/placeholder.svg"}
                          alt={currentNews.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{currentNews.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{currentNews.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(currentNews.date).toLocaleDateString("ru-RU")}
                        </span>
                        {currentNews.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={currentNews.url} target="_blank" rel="noopener noreferrer">
                              Читать далее
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {news.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Новости не найдены</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">Контакты</h4>
              <p className="text-sm text-gray-300 mb-2">{settings?.organizationInfo.address}</p>
              <p className="text-sm text-gray-300 mb-2">Тел: {settings?.organizationInfo.phone}</p>
              <p className="text-sm text-gray-300">Email: {settings?.organizationInfo.email}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Полезные ссылки</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href={settings?.organizationInfo.website} className="hover:text-white transition-colors">
                    Официальный сайт
                  </a>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Панель администратора
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">О системе</h4>
              <p className="text-sm text-gray-300">
                Интерактивная информационная система для посетителей и сотрудников ОИЯИ
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ОИЯИ. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
