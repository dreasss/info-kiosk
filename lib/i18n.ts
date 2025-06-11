export const translations = {
  ru: {
    // Навигация
    home: "Главная",
    map: "Карта",
    gallery: "Галерея",
    news: "Новости",
    about: "О ОИЯИ",
    infrastructure: "Инфраструктура",
    admin: "Админ",

    // Общие
    loading: "Загрузка...",
    error: "Ошибка",
    close: "Закрыть",
    save: "Сохранить",
    cancel: "Отмена",
    search: "Поиск",
    filter: "Фильтр",
    all: "Все",

    // Карта
    youAreHere: "Вы здесь",
    route: "Маршрут",
    details: "Подробнее",
    buildRoute: "Построить маршрут",
    resetRoute: "Сбросить маршрут",
    distance: "Расстояние",
    duration: "Время в пути",
    walkingTime: "Время пешком",

    // Главная страница
    welcome: "Добро пожаловать",
    exploreMap: "Исследовать карту",
    viewGallery: "Посмотреть галерею",
    readNews: "Читать новости",
    aboutInstitute: "Об институте",
    viewInfrastructure: "Инфраструктура",

    // Новости
    latestNews: "Последние новости",
    readMore: "Читать далее",
    newsNotFound: "Новости не найдены",

    // Объекты
    objects: "Объекты",
    categories: "Категории",
    noObjectsFound: "Объекты не найдены",
    objectDetails: "Детали объекта",

    // Ошибки
    loadingError: "Ошибка загрузки",
    networkError: "Ошибка сети",
    tryAgain: "Попробовать снова",
  },
  en: {
    // Navigation
    home: "Home",
    map: "Map",
    gallery: "Gallery",
    news: "News",
    about: "About JINR",
    infrastructure: "Infrastructure",
    admin: "Admin",

    // Common
    loading: "Loading...",
    error: "Error",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    all: "All",

    // Map
    youAreHere: "You are here",
    route: "Route",
    details: "Details",
    buildRoute: "Build route",
    resetRoute: "Reset route",
    distance: "Distance",
    duration: "Duration",
    walkingTime: "Walking time",

    // Home page
    welcome: "Welcome",
    exploreMap: "Explore map",
    viewGallery: "View gallery",
    readNews: "Read news",
    aboutInstitute: "About institute",
    viewInfrastructure: "Infrastructure",

    // News
    latestNews: "Latest news",
    readMore: "Read more",
    newsNotFound: "News not found",

    // Objects
    objects: "Objects",
    categories: "Categories",
    noObjectsFound: "No objects found",
    objectDetails: "Object details",

    // Errors
    loadingError: "Loading error",
    networkError: "Network error",
    tryAgain: "Try again",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.ru

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || translations.ru[key] || key
}
