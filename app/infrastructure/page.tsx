"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TouchButton } from "@/components/ui/touch-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import {
  MapPin,
  Search,
  Building,
  Coffee,
  Car,
  Utensils,
  ShoppingBag,
  Heart,
  GraduationCap,
  Briefcase,
  Home,
  Loader2,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { fetchPOIs } from "@/lib/api"
import type { POI } from "@/types/poi"
import Link from "next/link"
import Image from "next/image"

const categoryIcons = {
  building: Building,
  entertainment: Coffee,
  entrance: Car,
  food: Utensils,
  shop: ShoppingBag,
  medical: Heart,
  education: GraduationCap,
  office: Briefcase,
}

const categoryColors = {
  building: "bg-blue-100 text-blue-800",
  entertainment: "bg-purple-100 text-purple-800",
  entrance: "bg-gray-100 text-gray-800",
  food: "bg-orange-100 text-orange-800",
  shop: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800",
  education: "bg-indigo-100 text-indigo-800",
  office: "bg-yellow-100 text-yellow-800",
}

export default function InfrastructurePage() {
  const { language } = useLanguage()
  const [pois, setPois] = useState<POI[]>([])
  const [filteredPois, setFilteredPois] = useState<POI[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Проверяем, что компонент смонтирован на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadPOIs()
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      filterPOIs()
    }
  }, [pois, searchTerm, selectedCategory, mounted])

  const loadPOIs = async () => {
    if (!mounted) return

    try {
      setLoading(true)
      const data = await fetchPOIs()
      setPois(data)
      setFilteredPois(data)
    } catch (error) {
      console.error("Ошибка загрузки объектов:", error)
      setPois([])
      setFilteredPois([])
    } finally {
      setLoading(false)
    }
  }

  const filterPOIs = () => {
    if (!mounted) return

    let filtered = pois

    if (selectedCategory !== "all") {
      filtered = filtered.filter((poi) => poi.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (poi) =>
          poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          poi.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          poi.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredPois(filtered)
  }

  const getCategoryName = (category: string) => {
    const categoryNames = {
      building: language === "ru" ? "Здания" : "Buildings",
      entertainment: language === "ru" ? "Развлечения" : "Entertainment",
      entrance: language === "ru" ? "Входы" : "Entrances",
      food: language === "ru" ? "Питание" : "Food",
      shop: language === "ru" ? "Магазины" : "Shops",
      medical: language === "ru" ? "Медицина" : "Medical",
      education: language === "ru" ? "Образование" : "Education",
      office: language === "ru" ? "Офисы" : "Offices",
    }
    return categoryNames[category as keyof typeof categoryNames] || category
  }

  // Показываем загрузку до монтирования компонента
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Шапка */}
        <header className="bg-gradient-to-r from-blue-600 to-sky-400 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Image src="/images/jinr-logo.png" alt="JINR Logo" width={50} height={50} className="rounded-lg" />
                <h1
                  className="text-2xl font-bold text-white"
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {language === "ru"
                    ? "Объединенный Институт Ядерных Исследований"
                    : "Joint Institute for Nuclear Research"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <TouchButton asChild touchSize="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Link href="/">
                    <Home className="h-5 w-5" />
                  </Link>
                </TouchButton>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">{language === "ru" ? "Загрузка объектов..." : "Loading objects..."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Шапка */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image src="/images/jinr-logo.png" alt="JINR Logo" width={50} height={50} className="rounded-lg" />
              <h1
                className="text-2xl font-bold text-white"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {language === "ru"
                  ? "Объединенный Институт Ядерных Исследований"
                  : "Joint Institute for Nuclear Research"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <TouchButton asChild touchSize="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Link href="/">
                  <Home className="h-5 w-5" />
                </Link>
              </TouchButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {language === "ru" ? "Инфраструктура" : "Infrastructure"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "ru"
              ? "Исследуйте объекты и инфраструктуру института"
              : "Explore institute objects and infrastructure"}
          </p>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={language === "ru" ? "Поиск объектов..." : "Search objects..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "ru" ? "Выберите категорию" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ru" ? "Все категории" : "All categories"}</SelectItem>
                  <SelectItem value="building">{getCategoryName("building")}</SelectItem>
                  <SelectItem value="entertainment">{getCategoryName("entertainment")}</SelectItem>
                  <SelectItem value="entrance">{getCategoryName("entrance")}</SelectItem>
                  <SelectItem value="food">{getCategoryName("food")}</SelectItem>
                  <SelectItem value="shop">{getCategoryName("shop")}</SelectItem>
                  <SelectItem value="medical">{getCategoryName("medical")}</SelectItem>
                  <SelectItem value="education">{getCategoryName("education")}</SelectItem>
                  <SelectItem value="office">{getCategoryName("office")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Результаты */}
        <div className="mb-6">
          <p className="text-gray-600">
            {language === "ru" ? "Найдено" : "Found"}: {filteredPois.length}{" "}
            {language === "ru" ? "объектов" : "objects"}
          </p>
        </div>

        {/* Сетка объектов */}
        {filteredPois.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === "ru" ? "Объекты не найдены" : "No objects found"}
            </h3>
            <p className="text-gray-600">
              {language === "ru" ? "Попробуйте изменить параметры поиска" : "Try changing your search parameters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPois.map((poi) => {
              const IconComponent = categoryIcons[poi.category as keyof typeof categoryIcons] || Building
              const categoryColor =
                categoryColors[poi.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"

              return (
                <Card
                  key={poi.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    {poi.images && poi.images.length > 0 && (
                      <div className="h-48 overflow-hidden">
                        <Image
                          src={poi.images[0] || "/placeholder.svg?height=200&width=300"}
                          alt={poi.name}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className={categoryColor}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {getCategoryName(poi.category)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{poi.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-3">
                      {poi.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {poi.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{poi.address}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          window.location.href = `/map?poi=${poi.id}`
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {language === "ru" ? "На карте" : "On map"}
                      </Button>

                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // Показать детали объекта
                        }}
                      >
                        {language === "ru" ? "Подробнее" : "Details"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
