export interface JinrEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description?: string
  url?: string
  category?: string
}

// Парсер для событий ОИЯИ
export class EventsParser {
  private static readonly AGENDA_URL = "https://www.jinr.ru/agenda/"
  private static readonly CORS_PROXY = "https://api.allorigins.win/get?url="

  static async fetchEvents(): Promise<JinrEvent[]> {
    try {
      // Используем CORS прокси для обхода ограничений
      const response = await fetch(`${this.CORS_PROXY}${encodeURIComponent(this.AGENDA_URL)}`)
      const data = await response.json()

      if (!data.contents) {
        throw new Error("No content received from proxy")
      }

      return this.parseHTML(data.contents)
    } catch (error) {
      console.error("Error fetching events:", error)
      // Возвращаем демо-данные в случае ошибки
      return this.getDemoEvents()
    }
  }

  private static parseHTML(html: string): JinrEvent[] {
    const events: JinrEvent[] = []

    try {
      // Создаем временный DOM элемент для парсинга
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Ищем элементы событий (адаптируем под структуру сайта ОИЯИ)
      const eventElements = doc.querySelectorAll(".event-item, .agenda-item, .news-item, article")

      eventElements.forEach((element, index) => {
        try {
          const event = this.parseEventElement(element, index)
          if (event) {
            events.push(event)
          }
        } catch (error) {
          console.warn("Error parsing event element:", error)
        }
      })

      // Если не удалось найти события стандартным способом, пробуем альтернативные селекторы
      if (events.length === 0) {
        const alternativeElements = doc.querySelectorAll(
          'div[class*="event"], div[class*="agenda"], div[class*="news"]',
        )
        alternativeElements.forEach((element, index) => {
          try {
            const event = this.parseEventElement(element, index)
            if (event) {
              events.push(event)
            }
          } catch (error) {
            console.warn("Error parsing alternative event element:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error parsing HTML:", error)
    }

    // Сортируем события по дате
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  private static parseEventElement(element: Element, index: number): JinrEvent | null {
    try {
      // Извлекаем заголовок
      const titleElement = element.querySelector("h1, h2, h3, h4, .title, .event-title, a")
      const title = titleElement?.textContent?.trim() || `Событие ${index + 1}`

      // Извлекаем дату
      const dateElement = element.querySelector('.date, .event-date, time, [class*="date"]')
      let date = dateElement?.textContent?.trim() || dateElement?.getAttribute("datetime")

      // Если дата не найдена, пробуем найти в тексте
      if (!date) {
        const text = element.textContent || ""
        const dateMatch = text.match(/(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})|(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/)
        date = dateMatch ? dateMatch[0] : new Date().toISOString().split("T")[0]
      }

      // Нормализуем дату
      date = this.normalizeDate(date)

      // Извлекаем время
      const timeElement = element.querySelector('.time, .event-time, [class*="time"]')
      let time = timeElement?.textContent?.trim()

      // Если время не найдено, пробуем найти в тексте
      if (!time) {
        const text = element.textContent || ""
        const timeMatch = text.match(/(\d{1,2}:\d{2})|(\d{1,2}\.\d{2})/)
        time = timeMatch ? timeMatch[0] : "10:00"
      }

      // Извлекаем место проведения
      const locationElement = element.querySelector('.location, .venue, .place, [class*="location"]')
      let location = locationElement?.textContent?.trim()

      // Если место не найдено, пробуем найти в тексте
      if (!location) {
        const text = element.textContent || ""
        const locationMatch = text.match(/(зал|аудитория|корпус|здание|лаборатория)\s*[№\d\w-]+/i)
        location = locationMatch ? locationMatch[0] : "ОИЯИ"
      }

      // Извлекаем описание
      const descElement = element.querySelector(".description, .content, .summary, p")
      const description = descElement?.textContent?.trim()

      // Извлекаем ссылку
      const linkElement = element.querySelector("a")
      const url = linkElement?.getAttribute("href")

      return {
        id: `event_${Date.now()}_${index}`,
        title,
        date,
        time: time || "10:00",
        location: location || "ОИЯИ",
        description,
        url: url ? (url.startsWith("http") ? url : `https://www.jinr.ru${url}`) : undefined,
        category: this.categorizeEvent(title, description),
      }
    } catch (error) {
      console.warn("Error parsing individual event:", error)
      return null
    }
  }

  private static normalizeDate(dateStr: string): string {
    try {
      // Пробуем различные форматы даты
      let date: Date

      // Формат DD.MM.YYYY или DD/MM/YYYY
      if (/\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(dateStr)) {
        const parts = dateStr.split(/[.\-/]/)
        const day = Number.parseInt(parts[0])
        const month = Number.parseInt(parts[1]) - 1 // месяцы в JS начинаются с 0
        const year = Number.parseInt(parts[2])
        date = new Date(year < 100 ? 2000 + year : year, month, day)
      }
      // Формат YYYY-MM-DD
      else if (/\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}/.test(dateStr)) {
        date = new Date(dateStr)
      }
      // Пробуем стандартный парсинг
      else {
        date = new Date(dateStr)
      }

      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        date = new Date()
      }

      return date.toISOString().split("T")[0]
    } catch (error) {
      console.warn("Error normalizing date:", error)
      return new Date().toISOString().split("T")[0]
    }
  }

  private static categorizeEvent(title: string, description?: string): string {
    const text = `${title} ${description || ""}`.toLowerCase()

    if (text.includes("конференция") || text.includes("conference")) return "conference"
    if (text.includes("семинар") || text.includes("seminar")) return "seminar"
    if (text.includes("лекция") || text.includes("lecture")) return "lecture"
    if (text.includes("защита") || text.includes("defense")) return "defense"
    if (text.includes("совещание") || text.includes("meeting")) return "meeting"
    if (text.includes("выставка") || text.includes("exhibition")) return "exhibition"

    return "other"
  }

  // Демо-данные для случая, когда парсинг не работает
  private static getDemoEvents(): JinrEvent[] {
    const today = new Date()
    const events: JinrEvent[] = []

    for (let i = 0; i < 10; i++) {
      const eventDate = new Date(today)
      eventDate.setDate(today.getDate() + i)

      events.push({
        id: `demo_event_${i}`,
        title: `Научный семинар ${i + 1}`,
        date: eventDate.toISOString().split("T")[0],
        time: `${10 + (i % 8)}:00`,
        location: `Конференц-зал ${(i % 3) + 1}`,
        description: `Описание научного мероприятия ${i + 1}. Обсуждение актуальных вопросов ядерной физики.`,
        category: ["conference", "seminar", "lecture"][i % 3],
      })
    }

    return events
  }
}

// Функция для получения событий с кэшированием
export async function getJinrEvents(): Promise<JinrEvent[]> {
  const cacheKey = "jinr_events_cache"
  const cacheTimeKey = "jinr_events_cache_time"
  const cacheTimeout = 60 * 60 * 1000 // 1 час

  try {
    // Проверяем кэш
    const cachedEvents = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheTimeKey)

    if (cachedEvents && cacheTime) {
      const timeDiff = Date.now() - Number.parseInt(cacheTime)
      if (timeDiff < cacheTimeout) {
        return JSON.parse(cachedEvents)
      }
    }

    // Загружаем новые события
    const events = await EventsParser.fetchEvents()

    // Сохраняем в кэш
    localStorage.setItem(cacheKey, JSON.stringify(events))
    localStorage.setItem(cacheTimeKey, Date.now().toString())

    return events
  } catch (error) {
    console.error("Error getting JINR events:", error)

    // Возвращаем кэшированные данные в случае ошибки
    const cachedEvents = localStorage.getItem(cacheKey)
    if (cachedEvents) {
      return JSON.parse(cachedEvents)
    }

    // Возвращаем демо-данные как последний вариант
    return EventsParser.getDemoEvents()
  }
}
