"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { RSSTicker } from "@/components/ui/rss-ticker"
import { ClockDate } from "@/components/ui/clock-date"
import { TouchButton } from "@/components/ui/touch-button"
import { useLanguage } from "@/lib/language-context"
import { Map, Building2, Newspaper, Users, Phone, Mail, Globe, Settings } from "lucide-react"
import { fetchSettings } from "@/lib/api"
import type { SystemSettings } from "@/types/settings"

export default function HomePage() {
  const { t, language } = useLanguage()
  const [settings, setSettings] = useState<SystemSettings | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const systemSettings = await fetchSettings()
        setSettings(systemSettings)
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Шапка с логотипом, часами и переключателем языка */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Логотип и название */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Image
                  src="/images/jinr-logo.png"
                  alt="JINR Logo"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white/20 shadow-xl bg-white/10 p-2"
                />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold mb-2 text-white"
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  Объединенный Институт Ядерных Исследований
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  {language === "ru" ? "Международный научно-исследовательский центр" : "International Research Center"}
                </p>
              </div>
            </div>

            {/* Часы и дата по центру */}
            <div className="flex-1 flex justify-center">
              <ClockDate />
            </div>

            {/* Переключатель языка и кнопка настроек */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <TouchButton asChild variant="ghost" className="text-white hover:bg-white/20">
                <Link href="/admin/login">
                  <Settings className="h-6 w-6" />
                </Link>
              </TouchButton>
            </div>
          </div>
        </div>
      </header>

      {/* RSS бегущая строка */}
      <RSSTicker />

      {/* Основной контент */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {language === "ru" ? "Информационная система" : "Information System"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "ru"
              ? "Добро пожаловать в интерактивную информационную систему. Выберите нужный раздел для получения информации."
              : "Welcome to the interactive information system. Select the desired section to get information."}
          </p>
        </div>

        {/* Основные разделы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <TouchButton asChild touchSize="xl" className="h-auto p-0">
            <Link href="/map">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Map className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {language === "ru" ? "Интерактивная карта" : "Interactive Map"}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {language === "ru"
                      ? "Навигация по территории с построением маршрутов"
                      : "Territory navigation with route building"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </TouchButton>

          <TouchButton asChild touchSize="xl" className="h-auto p-0">
            <Link href="/infrastructure">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {language === "ru" ? "Инфраструктура" : "Infrastructure"}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {language === "ru"
                      ? "Информация об объектах и сооружениях"
                      : "Information about objects and structures"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </TouchButton>

          <TouchButton asChild touchSize="xl" className="h-auto p-0">
            <Link href="/news">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <Newspaper className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{language === "ru" ? "Новости" : "News"}</h3>
                  <p className="text-gray-600 text-lg">
                    {language === "ru" ? "Актуальные новости и события" : "Current news and events"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </TouchButton>

          <TouchButton asChild touchSize="xl" className="h-auto p-0">
            <Link href="/about">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {language === "ru" ? "Об ОИЯИ" : "About JINR"}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {language === "ru" ? "История и деятельность института" : "History and activities of the institute"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </TouchButton>
        </div>

        {/* Контактная информация */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {language === "ru" ? "Контактная информация" : "Contact Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{language === "ru" ? "Телефон" : "Phone"}</p>
                  <p className="text-gray-600">+7 (496) 216-50-59</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-gray-600">post@jinr.ru</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{language === "ru" ? "Веб-сайт" : "Website"}</p>
                  <p className="text-gray-600">www.jinr.ru</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
