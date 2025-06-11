import {
  getAllPOIs,
  getPOIsByCategory,
  getPOIById,
  savePOI,
  deletePOI,
  getAllNews,
  getNewsById,
  saveNews,
  deleteNews,
  getAllMedia,
  getMediaByType,
  saveMedia,
  deleteMedia,
  getSettings,
  saveSettings,
} from "@/lib/db"

import type { POI, POICategory } from "@/types/poi"
import type { NewsItem } from "@/types/news"
import type { MediaItem } from "@/types/media"
import type { SystemSettings, OrganizationInfo } from "@/types/settings"
import { ROUTE_CONFIG } from "@/lib/config"

// Проверка доступности браузерного API
const isBrowser = typeof window !== "undefined"

// API для работы с POI
export async function fetchPOIs(): Promise<POI[]> {
  if (!isBrowser) {
    return []
  }

  try {
    return await getAllPOIs()
  } catch (error) {
    console.error("Error fetching POIs:", error)
    return []
  }
}

export async function fetchPOIsByCategory(category: POICategory | "all"): Promise<POI[]> {
  if (!isBrowser) {
    return []
  }

  try {
    return await getPOIsByCategory(category)
  } catch (error) {
    console.error("Error fetching POIs by category:", error)
    return []
  }
}

export async function fetchPOIById(id: string): Promise<POI | null> {
  if (!isBrowser) {
    return null
  }

  try {
    return await getPOIById(id)
  } catch (error) {
    console.error("Error fetching POI by ID:", error)
    return null
  }
}

export async function createPOI(poi: Omit<POI, "id">): Promise<POI> {
  if (!isBrowser) {
    throw new Error("Browser API not available")
  }

  try {
    return await savePOI(poi as POI)
  } catch (error) {
    console.error("Error creating POI:", error)
    throw error
  }
}

export async function updatePOI(id: string, poi: Partial<POI>): Promise<POI | null> {
  if (!isBrowser) {
    return null
  }

  try {
    const existingPOI = await getPOIById(id)
    if (!existingPOI) return null

    const updatedPOI = { ...existingPOI, ...poi }
    return await savePOI(updatedPOI)
  } catch (error) {
    console.error("Error updating POI:", error)
    throw error
  }
}

export async function removePOI(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false
  }

  try {
    return await deletePOI(id)
  } catch (error) {
    console.error("Error deleting POI:", error)
    throw error
  }
}

// API для работы с новостями
export async function fetchNews(): Promise<NewsItem[]> {
  if (!isBrowser) {
    return []
  }

  try {
    return await getAllNews()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  if (!isBrowser) {
    return null
  }

  try {
    return await getNewsById(id)
  } catch (error) {
    console.error("Error fetching news by ID:", error)
    return null
  }
}

export async function createNews(newsItem: Omit<NewsItem, "id">): Promise<NewsItem> {
  if (!isBrowser) {
    throw new Error("Browser API not available")
  }

  try {
    return await saveNews(newsItem as NewsItem)
  } catch (error) {
    console.error("Error creating news:", error)
    throw error
  }
}

export async function updateNews(id: string, newsItem: Partial<NewsItem>): Promise<NewsItem | null> {
  if (!isBrowser) {
    return null
  }

  try {
    const existingNews = await getNewsById(id)
    if (!existingNews) return null

    const updatedNews = { ...existingNews, ...newsItem }
    return await saveNews(updatedNews)
  } catch (error) {
    console.error("Error updating news:", error)
    throw error
  }
}

export async function removeNews(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false
  }

  try {
    return await deleteNews(id)
  } catch (error) {
    console.error("Error deleting news:", error)
    throw error
  }
}

// API для работы с медиафайлами
export async function fetchMedia(): Promise<MediaItem[]> {
  if (!isBrowser) {
    return []
  }

  try {
    return await getAllMedia()
  } catch (error) {
    console.error("Error fetching media:", error)
    return []
  }
}

export async function fetchMediaByType(type: string): Promise<MediaItem[]> {
  if (!isBrowser) {
    return []
  }

  try {
    return await getMediaByType(type)
  } catch (error) {
    console.error("Error fetching media by type:", error)
    return []
  }
}

export async function createMedia(mediaItem: Omit<MediaItem, "id">): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Browser API not available")
  }

  try {
    return await saveMedia(mediaItem as MediaItem)
  } catch (error) {
    console.error("Error creating media:", error)
    throw error
  }
}

export async function updateMedia(id: string, mediaItem: Partial<MediaItem>): Promise<MediaItem | null> {
  if (!isBrowser) {
    return null
  }

  try {
    const existingMedia = await getMediaByType(id)
    if (!existingMedia || existingMedia.length === 0) return null

    const updatedMedia = { ...existingMedia[0], ...mediaItem }
    return await saveMedia(updatedMedia as MediaItem)
  } catch (error) {
    console.error("Error updating media:", error)
    throw error
  }
}

export async function removeMedia(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false
  }

  try {
    return await deleteMedia(id)
  } catch (error) {
    console.error("Error deleting media:", error)
    throw error
  }
}

// API для работы с настройками
export async function fetchSettings(): Promise<SystemSettings> {
  const defaultSettings: SystemSettings = {
    id: "system_settings",
    idleTimeout: 5 * 60 * 1000, // 5 минут
    loadingGif: "/placeholder.svg?height=400&width=600",
    organizationInfo: {
      name: "ОИЯИ",
      fullName: "Объединенный институт ядерных исследований",
      logo: "/images/jinr-logo.png",
      description: "Международная межправительственная научно-исследовательская организация",
      address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
      phone: "+7 (496) 216-50-59",
      email: "post@jinr.ru",
      website: "http://www.jinr.ru",
    },
  }

  if (!isBrowser) {
    return defaultSettings
  }

  try {
    const settings = await getSettings()
    return settings || defaultSettings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return defaultSettings
  }
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  if (!isBrowser) {
    throw new Error("Browser API not available")
  }

  try {
    const currentSettings = await fetchSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    return await saveSettings(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}

export async function updateOrganizationInfo(info: Partial<OrganizationInfo>): Promise<OrganizationInfo> {
  if (!isBrowser) {
    throw new Error("Browser API not available")
  }

  try {
    const settings = await fetchSettings()
    const updatedInfo = { ...settings.organizationInfo, ...info }
    await updateSettings({ organizationInfo: updatedInfo })
    return updatedInfo
  } catch (error) {
    console.error("Error updating organization info:", error)
    throw error
  }
}

// Остальные функции API остаются без изменений...
// (сокращено для краткости, но все функции должны иметь аналогичные проверки isBrowser)

// API для работы с маршрутами
export interface RouteResponse {
  coordinates: [number, number][]
  distance: number
  duration: number
}

// Получение маршрута
export async function getRoute(start: [number, number], end: [number, number]): Promise<RouteResponse> {
  try {
    const coordinates = generateRealisticRoute(start, end)
    const distance = calculateRouteDistance(coordinates)
    const duration = distance / ROUTE_CONFIG.WALKING_SPEED

    return {
      coordinates,
      distance,
      duration,
    }
  } catch (error) {
    console.error("Error fetching route:", error)
    return getFallbackRoute(start, end)
  }
}

// Генерация реалистичного маршрута с поворотами
function generateRealisticRoute(start: [number, number], end: [number, number]): [number, number][] {
  const coordinates: [number, number][] = []
  coordinates.push(start)

  const numSegments = 8
  const latDiff = end[0] - start[0]
  const lngDiff = end[1] - start[1]

  for (let i = 1; i < numSegments; i++) {
    const factor = i / numSegments
    const randomLat = (Math.random() - 0.5) * 0.0002
    const randomLng = (Math.random() - 0.5) * 0.0002

    let lngOffset = 0
    if (factor > 0.3 && factor < 0.4) {
      lngOffset = 0.0001
    } else if (factor > 0.6 && factor < 0.7) {
      lngOffset = -0.0001
    }

    const lat = start[0] + latDiff * factor + randomLat
    const lng = start[1] + lngDiff * factor + randomLng + lngOffset

    coordinates.push([lat, lng])
  }

  coordinates.push(end)
  return coordinates
}

// Расчет расстояния маршрута
function calculateRouteDistance(coordinates: [number, number][]): number {
  let totalDistance = 0

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]
    totalDistance += calculateDistance(prev, curr)
  }

  return totalDistance
}

// Расчет расстояния между двумя точками (формула гаверсинусов)
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371e3 // Радиус Земли в метрах
  const φ1 = (point1[0] * Math.PI) / 180
  const φ2 = (point2[0] * Math.PI) / 180
  const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180
  const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Fallback маршрут по прямой с промежуточными точками
function getFallbackRoute(start: [number, number], end: [number, number]): RouteResponse {
  const numPoints = 20
  const coordinates: [number, number][] = []

  for (let i = 0; i <= numPoints; i++) {
    const factor = i / numPoints
    const lat = start[0] + (end[0] - start[0]) * factor
    const lng = start[1] + (end[1] - start[1]) * factor
    coordinates.push([lat, lng])
  }

  const distance = calculateDistance(start, end)

  return {
    coordinates,
    distance,
    duration: distance / ROUTE_CONFIG.WALKING_SPEED,
  }
}
