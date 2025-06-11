"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getAllPOIs, getPOIsByCategory } from "@/lib/db"
import type { POI } from "@/types/poi"

const categoryIcons = {
  building: Building,
  entertainment: Coffee,
  parking: Car,
  restaurant: Utensils,
  shop: ShoppingBag,
  medical: Heart,
  education: GraduationCap,
  office: Briefcase,
}

const categoryColors = {
  building: "bg-blue-100 text-blue-800",
  entertainment: "bg-purple-100 text-purple-800",
  parking: "bg-gray-100 text-gray-800",
  restaurant: "bg-orange-100 text-orange-800",
  shop: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800",
  education: "bg-indigo-100 text-indigo-800",
  office: "bg-yellow-100 text-yellow-800",
}

export default function InfrastructurePage() {
  const { t } = useLanguage()
  const [pois, setPois] = useState<POI[]>([])
  const [filteredPois, setFilteredPois] = useState<POI[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPOIs()
  }, [])

  useEffect(() => {
    filterPOIs()
  }, [pois, searchTerm, selectedCategory])

  const loadPOIs = async () => {
    try {
      setLoading(true)
      const data = await getAllPOIs()
      setPois(data)
    } catch (error) {
      console.error("Ошибка загрузки объектов:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPOIs = async () => {
    try {
      let filtered = pois

      if (selectedCategory !== "all") {
        filtered = await getPOIsByCategory(selectedCategory)
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (poi) =>
            poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poi.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setFilteredPois(filtered)
    } catch (error) {
      console.error("Ошибка фильтрации объектов:", error)
      setFilteredPois([])
    }
  }

  const getCategoryName = (category: string) => {
    const categoryNames = {
      building: t("categories.building"),
      entertainment: t("categories.entertainment"),
      parking: t("categories.parking"),
      restaurant: t("categories.restaurant"),
      shop: t("categories.shop"),
      medical: t("categories.medical"),
      education: t("categories.education"),
      office: t("categories.office"),
    }
    return categoryNames[category as keyof typeof categoryNames] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("infrastructure.title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("infrastructure.description")}</p>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={t("infrastructure.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("infrastructure.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("categories.all")}</SelectItem>
                  <SelectItem value="building">{t("categories.building")}</SelectItem>
                  <SelectItem value="entertainment">{t("categories.entertainment")}</SelectItem>
                  <SelectItem value="parking">{t("categories.parking")}</SelectItem>
                  <SelectItem value="restaurant">{t("categories.restaurant")}</SelectItem>
                  <SelectItem value="shop">{t("categories.shop")}</SelectItem>
                  <SelectItem value="medical">{t("categories.medical")}</SelectItem>
                  <SelectItem value="education">{t("categories.education")}</SelectItem>
                  <SelectItem value="office">{t("categories.office")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Результаты */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t("infrastructure.found")}: {filteredPois.length} {t("infrastructure.objects")}
          </p>
        </div>

        {/* Сетка объектов */}
        {filteredPois.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("infrastructure.noObjects")}</h3>
            <p className="text-gray-600">{t("infrastructure.noObjectsDescription")}</p>
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
                        <img
                          src={poi.images[0] || "/placeholder.svg"}
                          alt={poi.name}
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
                          // Переход к карте с выбранным объектом
                          window.location.href = `/map?poi=${poi.id}`
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {t("infrastructure.showOnMap")}
                      </Button>

                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // Показать детали объекта
                          // Можно открыть модальное окно или перейти на страницу деталей
                        }}
                      >
                        {t("infrastructure.details")}
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
