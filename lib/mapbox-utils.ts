// Утилиты для работы с Mapbox

// Mapbox token - в реальном приложении следует хранить в переменных окружения
export const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

// Доступные стили карт Mapbox
export const MAPBOX_STYLES = {
  streets: "streets-v11",
  outdoors: "outdoors-v11",
  light: "light-v10",
  dark: "dark-v10",
  satellite: "satellite-v9",
  satelliteStreets: "satellite-streets-v11",
  navigationDay: "navigation-day-v1",
  navigationNight: "navigation-night-v1",
}

// Функция для получения URL тайлов Mapbox
export function getMapboxTileUrl(style: string = MAPBOX_STYLES.streets) {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
}

// Функция для получения статической карты Mapbox
export function getMapboxStaticImageUrl(
  center: [number, number],
  zoom: number,
  width = 600,
  height = 400,
  style: string = MAPBOX_STYLES.streets,
) {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${center[1]},${center[0]},${zoom},0/${width}x${height}?access_token=${MAPBOX_TOKEN}`
}

// Функция для получения URL маршрута Mapbox
export function getMapboxDirectionsUrl(start: [number, number], end: [number, number]) {
  return `https://api.mapbox.com/directions/v5/mapbox/walking/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
}
