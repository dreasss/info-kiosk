"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TouchButton } from "@/components/ui/touch-button"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { fetchPOIs } from "@/lib/api"
import { type POI, type POICategory, CATEGORIES } from "@/types/poi"
import { Search, MapPin, Info, Home, Building, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"

// Динамический импорт компонента POIDetail
const POIDetail = dynamic(() => import("@/components/map/poi-detail"), {
  ssr: false,
})

export default function InfrastructurePage() {
  const [pois, setPois] = useState<POI[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<POICategory | "all">("all")
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const { t, language } = useLanguage()

  // Загрузка объектов при монтировании
  useEffect(() => {
    const loadPOIs = async () => {
      try {
        const data = await fetchPOIs()
        setPois(data)
      } catch (error) {
        console.error("Error loading POIs:", error)
      }
    }

    loadPOIs()
  }, [])

  // Фильтрация объектов по поисковому запросу и категории
  const filteredPOIs = useMemo(() => {
    return pois.filter((poi) => {
      const matchesSearch =
        searchQuery === "" ||
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.address.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || poi.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [pois, searchQuery, selectedCategory])

  // Группировка объектов по первой букве для алфавитного указателя
  const poisByLetter = useMemo(() => {
    const grouped: Record<string, POI[]> = {}

    filteredPOIs.forEach((poi) => {
      const firstLetter = poi.name.charAt(0).toUpperCase()
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = []
      }
      grouped[firstLetter].push(poi)
    })

    return grouped
  }, [filteredPOIs])

  // Получение всех доступных первых букв
  const availableLetters = useMemo(() => {
    return Object.keys(poisByLetter).sort()
  }, [poisByLetter])

  const handleShowDetail = (poi: POI) => {
    setSelectedPoi(poi)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{language === "ru" ? "Инфраструктура" : "Infrastructure"}</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <TouchButton asChild touchSize="lg" className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              {language === "ru" ? "На главную" : "Home"}
            </Link>
          </TouchButton>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="h-auto p-1">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {language === "ru" ? "Все объекты" : "All objects"}
            </TabsTrigger>
            {Object.entries(CATEGORIES).map(([key, category]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2"
                onClick={() => setSelectedCategory(key as POICategory)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={language === "ru" ? "Поиск объектов..." : "Search objects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Алфавитный указатель */}
        <div className="mb-6 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-sm">{language === "ru" ? "Алфавитный указатель" : "Alphabetical index"}</h3>
            <Badge variant="outline" className="ml-auto">
              {filteredPOIs.length} {language === "ru" ? "объектов" : "objects"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableLetters.map((letter) => (
              <Button
                key={letter}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 font-medium"
                onClick={() => {
                  const element = document.getElementById(`letter-${letter}`)
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {availableLetters.length > 0 ? (
              availableLetters.map((letter) => (
                <div key={letter} className="mb-8">
                  <h2 id={`letter-${letter}`} className="text-2xl font-bold mb-4 sticky top-0 bg-white py-2 z-10">
                    {letter}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {poisByLetter[letter].map((poi) => (
                      <Card key={poi.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-40">
                          <Image
                            src={poi.images[0] || "/placeholder.svg?height=200&width=300"}
                            alt={poi.name}
                            fill
                            className="object-cover"
                          />
                          <div
                            className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white rounded"
                            style={{ backgroundColor: CATEGORIES[poi.category].color }}
                          >
                            {CATEGORIES[poi.category].name}
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{poi.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{poi.shortDescription}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{poi.address}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={() => handleShowDetail(poi)} className="w-full" variant="outline">
                            <Info className="h-4 w-4 mr-2" />
                            {language === "ru" ? "Подробнее" : "Details"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-6" />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {language === "ru" ? "Объекты не найдены" : "No objects found"}
                </h3>
                <p className="text-gray-500">
                  {language === "ru"
                    ? "Попробуйте изменить параметры поиска или фильтрации"
                    : "Try changing your search or filter parameters"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  {language === "ru" ? "Сбросить фильтры" : "Reset filters"}
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {Object.entries(CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPOIs
                  .filter((poi) => poi.category === key)
                  .map((poi) => (
                    <Card key={poi.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <Image
                          src={poi.images[0] || "/placeholder.svg?height=200&width=300"}
                          alt={poi.name}
                          fill
                          className="object-cover"
                        />
                        <div
                          className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white rounded"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{poi.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{poi.shortDescription}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{poi.address}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={() => handleShowDetail(poi)} className="w-full" variant="outline">
                          <Info className="h-4 w-4 mr-2" />
                          {language === "ru" ? "Подробнее" : "Details"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Детальная информация об объекте */}
      {showDetail && selectedPoi && <POIDetail poi={selectedPoi} onClose={handleCloseDetail} />}
    </div>
  )
}
