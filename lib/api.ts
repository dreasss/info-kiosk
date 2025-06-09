import type { POI, POICategory } from "@/types/poi"
import type { NewsItem } from "@/types/news"
import type { SystemSettings, OrganizationInfo } from "@/types/settings"
import { DEFAULT_ORGANIZATION_INFO, ROUTE_CONFIG } from "@/lib/config"
import type { MediaItem } from "@/types/media"

// Имитация базы данных с использованием localStorage
const DB_KEYS = {
  POIS: "interactive_map_pois",
  NEWS: "interactive_map_news",
  SETTINGS: "interactive_map_settings",
}

// Инициализация базы данных с демо-данными
function initializeDB() {
  // Проверяем, инициализирована ли уже база данных
  if (!localStorage.getItem(DB_KEYS.POIS)) {
    // Демо-данные для POI
    const demoPOIs: POI[] = [
      {
        id: "1",
        name: "Объединенный институт ядерных исследований",
        shortDescription: "Международный научный центр, проводящий фундаментальные исследования.",
        fullDescription:
          "Объединенный институт ядерных исследований (ОИЯИ) — международная межправительственная научно-исследовательская организация, расположенная в Дубне. Институт специализируется на исследованиях в области ядерной физики, физики элементарных частиц и конденсированных сред.",
        coordinates: [56.7458, 37.189],
        images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
        address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
        category: "building",
      },
      {
        id: "2",
        name: "Дом ученых ОИЯИ",
        shortDescription: "Культурный центр для научного сообщества Дубны.",
        fullDescription:
          "Дом ученых ОИЯИ — культурный и общественный центр, где проводятся научные конференции, концерты, выставки и другие мероприятия. Это место встречи научного сообщества города и проведения различных культурных мероприятий.",
        coordinates: [56.743, 37.192],
        images: ["/placeholder.svg?height=200&width=300"],
        address: "ул. Жолио-Кюри, 8, Дубна, Московская область",
        category: "entertainment",
      },
      {
        id: "3",
        name: "Лаборатория ядерных реакций",
        shortDescription: "Исследовательская лаборатория, специализирующаяся на синтезе новых элементов.",
        fullDescription:
          "Лаборатория ядерных реакций им. Г.Н. Флерова — одна из ведущих лабораторий ОИЯИ, где были синтезированы многие сверхтяжелые элементы таблицы Менделеева. Здесь находятся уникальные ускорители тяжелых ионов, позволяющие проводить эксперименты мирового уровня.",
        coordinates: [56.744, 37.187],
        images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
        address: "ул. Жолио-Кюри, 4, Дубна, Московская область",
        category: "building",
      },
      {
        id: "4",
        name: "Памятник И.В. Курчатову",
        shortDescription: "Монумент в честь выдающегося физика, основателя советской атомной науки.",
        fullDescription:
          "Памятник Игорю Васильевичу Курчатову, выдающемуся советскому физику, основателю и первому директору Института атомной энергии. Под его руководством были созданы первый в Европе атомный реактор, первая советская атомная бомба и первая в мире термоядерная бомба.",
        coordinates: [56.7425, 37.1915],
        images: ["/placeholder.svg?height=200&width=300"],
        address: "Площадь Курчатова, Дубна, Московская область",
        category: "attraction",
      },
      {
        id: "5",
        name: "Столовая ОИЯИ",
        shortDescription: "Столовая для сотрудников и гостей института.",
        fullDescription:
          "Столовая Объединенного института ядерных исследований предлагает разнообразное меню для сотрудников и гостей института. Здесь можно вкусно и недорого пообедать в перерыве между работой или экскурсией по территории института.",
        coordinates: [56.7445, 37.1875],
        images: ["/placeholder.svg?height=200&width=300"],
        address: "ул. Жолио-Кюри, 6, корп. 2, Дубна, Московская область",
        category: "food",
      },
      {
        id: "6",
        name: "Главная проходная ОИЯИ",
        shortDescription: "Центральный вход на территорию института.",
        fullDescription:
          "Главная проходная Объединенного института ядерных исследований. Здесь осуществляется контроль доступа на территорию института. Для посещения института необходимо иметь пропуск или быть в составе организованной экскурсионной группы.",
        coordinates: [56.7435, 37.1865],
        images: ["/placeholder.svg?height=200&width=300"],
        address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
        category: "entrance",
      },
    ]
    localStorage.setItem(DB_KEYS.POIS, JSON.stringify(demoPOIs))

    // Демо-данные для новостей
    const demoNews: NewsItem[] = [
      {
        id: "1",
        title: "Открытие нового ускорителя",
        content:
          "В ОИЯИ состоялось торжественное открытие нового ускорителя тяжелых ионов, который позволит проводить эксперименты по синтезу сверхтяжелых элементов с еще большей эффективностью.",
        image: "/placeholder.svg?height=200&width=300",
        date: new Date(Date.now() - 86400000).toISOString(), // вчера
        url: "#",
      },
      {
        id: "2",
        title: "Международная конференция по ядерной физике",
        content:
          "С 10 по 15 сентября в Доме ученых ОИЯИ пройдет международная конференция по ядерной физике, на которую съедутся ученые из более чем 30 стран мира.",
        image: "/placeholder.svg?height=200&width=300",
        date: new Date(Date.now() - 172800000).toISOString(), // позавчера
        url: "#",
      },
      {
        id: "3",
        title: "Новое открытие в области физики элементарных частиц",
        content:
          "Ученые ОИЯИ совместно с коллегами из ЦЕРН сделали важное открытие в области физики элементарных частиц, которое может привести к пересмотру некоторых аспектов Стандартной модели.",
        image: "/placeholder.svg?height=200&width=300",
        date: new Date(Date.now() - 259200000).toISOString(), // 3 дня назад
        url: "#",
      },
    ]
    localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(demoNews))

    // Настройки системы по умолчанию
    const defaultSettings: SystemSettings = {
      idleTimeout: 5 * 60 * 1000, // 5 минут
      loadingGif: "/placeholder.svg?height=400&width=600",
      organizationInfo: DEFAULT_ORGANIZATION_INFO,
    }
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  }
}

// Инициализация при импорте
if (typeof window !== "undefined") {
  initializeDB()
}

// API для работы с POI
export async function fetchPOIs(): Promise<POI[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pois = JSON.parse(localStorage.getItem(DB_KEYS.POIS) || "[]")
      resolve(pois)
    }, 300)
  })
}

export async function fetchPOIsByCategory(category: POICategory | "all"): Promise<POI[]> {
  const pois = await fetchPOIs()
  if (category === "all") {
    return pois
  }
  return pois.filter((poi) => poi.category === category)
}

export async function fetchPOIById(id: string): Promise<POI | null> {
  const pois = await fetchPOIs()
  const poi = pois.find((p) => p.id === id)
  return poi || null
}

export async function createPOI(poi: Omit<POI, "id">): Promise<POI> {
  const pois = await fetchPOIs()
  const newPOI: POI = {
    ...poi,
    id: Date.now().toString(),
  }
  pois.push(newPOI)
  localStorage.setItem(DB_KEYS.POIS, JSON.stringify(pois))
  return newPOI
}

export async function updatePOI(id: string, poi: Partial<POI>): Promise<POI | null> {
  const pois = await fetchPOIs()
  const index = pois.findIndex((p) => p.id === id)
  if (index === -1) return null

  const updatedPOI = { ...pois[index], ...poi }
  pois[index] = updatedPOI
  localStorage.setItem(DB_KEYS.POIS, JSON.stringify(pois))
  return updatedPOI
}

export async function deletePOI(id: string): Promise<boolean> {
  const pois = await fetchPOIs()
  const filteredPOIs = pois.filter((p) => p.id !== id)
  if (filteredPOIs.length === pois.length) return false
  localStorage.setItem(DB_KEYS.POIS, JSON.stringify(filteredPOIs))
  return true
}

// API для работы с новостями
export async function fetchNews(): Promise<NewsItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const news = JSON.parse(localStorage.getItem(DB_KEYS.NEWS) || "[]")
      resolve(news)
    }, 300)
  })
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  const news = await fetchNews()
  const newsItem = news.find((n) => n.id === id)
  return newsItem || null
}

export async function createNews(newsItem: Omit<NewsItem, "id">): Promise<NewsItem> {
  const news = await fetchNews()
  const newNewsItem: NewsItem = {
    ...newsItem,
    id: Date.now().toString(),
  }
  news.push(newNewsItem)
  localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(news))
  return newNewsItem
}

export async function updateNews(id: string, newsItem: Partial<NewsItem>): Promise<NewsItem | null> {
  const news = await fetchNews()
  const index = news.findIndex((n) => n.id === id)
  if (index === -1) return null

  const updatedNewsItem = { ...news[index], ...newsItem }
  news[index] = updatedNewsItem
  localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(news))
  return updatedNewsItem
}

export async function deleteNews(id: string): Promise<boolean> {
  const news = await fetchNews()
  const filteredNews = news.filter((n) => n.id !== id)
  if (filteredNews.length === news.length) return false
  localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(filteredNews))
  return true
}

// API для работы с настройками
export async function fetchSettings(): Promise<SystemSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const settings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || "{}")
      resolve(settings)
    }, 300)
  })
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const currentSettings = await fetchSettings()
  const updatedSettings = { ...currentSettings, ...settings }
  localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updatedSettings))
  return updatedSettings
}

export async function updateOrganizationInfo(info: Partial<OrganizationInfo>): Promise<OrganizationInfo> {
  const settings = await fetchSettings()
  const updatedInfo = { ...settings.organizationInfo, ...info }
  await updateSettings({ organizationInfo: updatedInfo })
  return updatedInfo
}

// API для работы с маршрутами
export interface RouteResponse {
  coordinates: [number, number][]
  distance: number
  duration: number
}

// Получение маршрута
export async function getRoute(start: [number, number], end: [number, number]): Promise<RouteResponse> {
  try {
    // Используем более простой подход - создаем маршрут с промежуточными точками
    // В реальном приложении здесь был бы запрос к Yandex Router API

    // Для демонстрации создаем реалистичный маршрут с поворотами
    const coordinates = generateRealisticRoute(start, end)

    // Рассчитываем расстояние
    const distance = calculateRouteDistance(coordinates)

    // Рассчитываем время (средняя скорость пешехода 5 км/ч = 1.39 м/с)
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

  // Добавляем стартовую точку
  coordinates.push(start)

  // Создаем промежуточные точки с небольшими отклонениями для имитации дорог
  const numSegments = 8
  const latDiff = end[0] - start[0]
  const lngDiff = end[1] - start[1]

  for (let i = 1; i < numSegments; i++) {
    const factor = i / numSegments

    // Добавляем небольшие случайные отклонения для имитации дорог
    const randomLat = (Math.random() - 0.5) * 0.0002
    const randomLng = (Math.random() - 0.5) * 0.0002

    // Создаем "повороты" на определенных участках
    const latOffset = 0
    let lngOffset = 0

    if (factor > 0.3 && factor < 0.4) {
      // Поворот направо
      lngOffset = 0.0001
    } else if (factor > 0.6 && factor < 0.7) {
      // Поворот налево
      lngOffset = -0.0001
    }

    const lat = start[0] + latDiff * factor + randomLat + latOffset
    const lng = start[1] + lngDiff * factor + randomLng + lngOffset

    coordinates.push([lat, lng])
  }

  // Добавляем конечную точку
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

// API для работы с медиафайлами
export async function fetchMedia(): Promise<MediaItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const media = JSON.parse(localStorage.getItem("interactive_map_media") || "[]")
      resolve(media)
    }, 300)
  })
}

export async function createMedia(mediaItem: Omit<MediaItem, "id">): Promise<MediaItem> {
  const media = await fetchMedia()
  const newMediaItem: MediaItem = {
    ...mediaItem,
    id: Date.now().toString(),
  }
  media.push(newMediaItem)
  localStorage.setItem("interactive_map_media", JSON.stringify(media))
  return newMediaItem
}

export async function updateMedia(id: string, mediaItem: Partial<MediaItem>): Promise<MediaItem | null> {
  const media = await fetchMedia()
  const index = media.findIndex((m) => m.id === id)
  if (index === -1) return null

  const updatedMediaItem = { ...media[index], ...mediaItem }
  media[index] = updatedMediaItem
  localStorage.setItem("interactive_map_media", JSON.stringify(media))
  return updatedMediaItem
}

export async function deleteMedia(id: string): Promise<boolean> {
  const media = await fetchMedia()
  const filteredMedia = media.filter((m) => m.id !== id)
  if (filteredMedia.length === media.length) return false
  localStorage.setItem("interactive_map_media", JSON.stringify(filteredMedia))
  return true
}
