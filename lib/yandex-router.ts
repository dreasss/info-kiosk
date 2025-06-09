export interface RouteResponse {
  coordinates: [number, number][]
  distance: number
  duration: number
}

// Упрощенная функция для получения маршрута
export async function getYandexRouteSimple(start: [number, number], end: [number, number]): Promise<RouteResponse> {
  try {
    // Используем более простой подход - создаем маршрут с промежуточными точками
    // В реальном приложении здесь был бы запрос к Yandex Router API

    // Для демонстрации создаем реалистичный маршрут с поворотами
    const coordinates = generateRealisticRoute(start, end)

    // Рассчитываем расстояние
    const distance = calculateRouteDistance(coordinates)

    // Рассчитываем время (средняя скорость пешехода 5 км/ч = 1.39 м/с)
    const duration = distance / 1.39

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
    duration: distance / 1.39, // Средняя скорость пешехода
  }
}
