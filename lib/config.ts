// Конфигурационные параметры приложения

// API ключи
export const YANDEX_MAPS_API_KEY = "95fa2365-208f-4311-887f-180fa5140230"
export const YANDEX_LOCATOR_API_KEY = "a5e23d99-b078-4df8-9e37-42ae3b91156b"

// Настройки карты
export const MAP_CONFIG = {
  // Координаты информационного киоска (обновленные координаты)
  KIOSK_LOCATION: [56.742278, 37.191899] as [number, number],
  DEFAULT_ZOOM: 16,
  // Стили маркеров
  MARKER_STYLES: {
    KIOSK: "islands#redDotIconWithCaption",
    POI: {
      building: "islands#blueIcon",
      attraction: "islands#violetIcon",
      entrance: "islands#redIcon",
      food: "islands#orangeIcon",
      entertainment: "islands#greenIcon",
    },
    SELECTED: "islands#darkBlueIcon",
  },
}

// Настройки маршрутов
export const ROUTE_CONFIG = {
  WALKING_SPEED: 1.4, // м/с (5 км/ч)
  ROUTE_COLOR: "#3b82f6",
  ROUTE_WIDTH: 6,
}

// Настройки системы
export const SYSTEM_CONFIG = {
  IDLE_TIMEOUT: 5 * 60 * 1000, // 5 минут в миллисекундах
  LOADING_ANIMATION_DURATION: 4000, // 4 секунды
  RSS_FEED_URL: "https://elementy.ru/rss/news", // Новый RSS канал
}

// Настройки организации по умолчанию
export const DEFAULT_ORGANIZATION_INFO = {
  name: "ОИЯИ",
  fullName: "Объединенный институт ядерных исследований",
  logo: "/images/jinr-logo.png",
  description:
    "Объединенный институт ядерных исследований (ОИЯИ) — международная межправительственная научно-исследовательская организация, расположенная в Дубне. Институт специализируется на исследованиях в области ядерной физики, физики элементарных частиц и конденсированных сред.",
  address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
  phone: "+7 (496) 216-50-59",
  email: "post@jinr.ru",
  website: "http://www.jinr.ru",
}
