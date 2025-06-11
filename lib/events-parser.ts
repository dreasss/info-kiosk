export interface JinrEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  url?: string;
  category?: string;
}

// Парсер для событий ОИЯИ
export class EventsParser {
  private static readonly AGENDA_URL = "https://www.jinr.ru/agenda/";
  private static readonly CORS_PROXIES = [
    "https://api.allorigins.win/get?url=",
    "https://cors-anywhere.herokuapp.com/",
    "https://api.codetabs.com/v1/proxy?quest=",
  ];

  static async fetchEvents(): Promise<JinrEvent[]> {
    // Пробуем различные CORS прокси
    for (const proxy of this.CORS_PROXIES) {
      try {
        console.log(`Trying to fetch events using proxy: ${proxy}`);

        let response: Response;
        let data: any;

        if (proxy.includes("allorigins")) {
          response = await fetch(
            `${proxy}${encodeURIComponent(this.AGENDA_URL)}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            },
          );
          data = await response.json();

          if (!data.contents) {
            throw new Error("No content received from allorigins proxy");
          }

          const events = this.parseHTML(data.contents);
          if (events.length > 0) {
            console.log(
              `Successfully fetched ${events.length} events using allorigins`,
            );
            return events;
          }
        } else {
          // Для других прокси
          response = await fetch(`${proxy}${this.AGENDA_URL}`, {
            method: "GET",
            headers: {
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          });

          if (response.ok) {
            const html = await response.text();
            const events = this.parseHTML(html);
            if (events.length > 0) {
              console.log(
                `Successfully fetched ${events.length} events using ${proxy}`,
              );
              return events;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch events using proxy ${proxy}:`, error);
        continue;
      }
    }

    console.log("All CORS proxies failed, returning demo events");
    // Возвращаем демо-данные в случае ошибки всех прокси
    return this.getDemoEvents();
  }

  private static parseHTML(html: string): JinrEvent[] {
    const events: JinrEvent[] = [];

    try {
      // Создаем временный DOM элемент для парсинга
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Ищем элементы событий (адаптируем под структуру сайта ОИЯИ)
      const eventElements = doc.querySelectorAll(
        ".event-item, .agenda-item, .news-item, article",
      );

      eventElements.forEach((element, index) => {
        try {
          const event = this.parseEventElement(element, index);
          if (event) {
            events.push(event);
          }
        } catch (error) {
          console.warn("Error parsing event element:", error);
        }
      });

      // Если не удалось найти события стандартным способом, пробуем альтернативные селекторы
      if (events.length === 0) {
        const alternativeElements = doc.querySelectorAll(
          'div[class*="event"], div[class*="agenda"], div[class*="news"]',
        );
        alternativeElements.forEach((element, index) => {
          try {
            const event = this.parseEventElement(element, index);
            if (event) {
              events.push(event);
            }
          } catch (error) {
            console.warn("Error parsing alternative event element:", error);
          }
        });
      }
    } catch (error) {
      console.error("Error parsing HTML:", error);
    }

    // Сортируем события по дате
    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  private static parseEventElement(
    element: Element,
    index: number,
  ): JinrEvent | null {
    try {
      // Извлекаем заголовок
      const titleElement = element.querySelector(
        "h1, h2, h3, h4, .title, .event-title, a",
      );
      const title = titleElement?.textContent?.trim() || `Событие ${index + 1}`;

      // Извлекаем дату
      const dateElement = element.querySelector(
        '.date, .event-date, time, [class*="date"]',
      );
      let date =
        dateElement?.textContent?.trim() ||
        dateElement?.getAttribute("datetime");

      // Если дата не найдена, пробуем найти в тексте
      if (!date) {
        const text = element.textContent || "";
        const dateMatch = text.match(
          /(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})|(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/,
        );
        date = dateMatch
          ? dateMatch[0]
          : new Date().toISOString().split("T")[0];
      }

      // Нормализуем дату
      date = this.normalizeDate(date);

      // Извлекаем время
      const timeElement = element.querySelector(
        '.time, .event-time, [class*="time"]',
      );
      let time = timeElement?.textContent?.trim();

      // Если время не найдено, пробуем найти в тексте
      if (!time) {
        const text = element.textContent || "";
        const timeMatch = text.match(/(\d{1,2}:\d{2})|(\d{1,2}\.\d{2})/);
        time = timeMatch ? timeMatch[0] : "10:00";
      }

      // Извлекаем место проведения
      const locationElement = element.querySelector(
        '.location, .venue, .place, [class*="location"]',
      );
      let location = locationElement?.textContent?.trim();

      // Если место не найдено, пробуем найти в тексте
      if (!location) {
        const text = element.textContent || "";
        const locationMatch = text.match(
          /(зал|аудитория|корпус|здание|лаборатория)\s*[№\d\w-]+/i,
        );
        location = locationMatch ? locationMatch[0] : "ОИЯИ";
      }

      // Извлекаем описание
      const descElement = element.querySelector(
        ".description, .content, .summary, p",
      );
      const description = descElement?.textContent?.trim();

      // Извлекаем ссылку
      const linkElement = element.querySelector("a");
      const url = linkElement?.getAttribute("href");

      return {
        id: `event_${Date.now()}_${index}`,
        title,
        date,
        time: time || "10:00",
        location: location || "ОИЯИ",
        description,
        url: url
          ? url.startsWith("http")
            ? url
            : `https://www.jinr.ru${url}`
          : undefined,
        category: this.categorizeEvent(title, description),
      };
    } catch (error) {
      console.warn("Error parsing individual event:", error);
      return null;
    }
  }

  private static normalizeDate(dateStr: string): string {
    try {
      // Пробуем различные форматы даты
      let date: Date;

      // Формат DD.MM.YYYY или DD/MM/YYYY
      if (/\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(dateStr)) {
        const parts = dateStr.split(/[.\-/]/);
        const day = Number.parseInt(parts[0]);
        const month = Number.parseInt(parts[1]) - 1; // месяцы в JS начинаются с 0
        const year = Number.parseInt(parts[2]);
        date = new Date(year < 100 ? 2000 + year : year, month, day);
      }
      // Формат YYYY-MM-DD
      else if (/\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}/.test(dateStr)) {
        date = new Date(dateStr);
      }
      // Пробуем стандартный парсинг
      else {
        date = new Date(dateStr);
      }

      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        date = new Date();
      }

      return date.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Error normalizing date:", error);
      return new Date().toISOString().split("T")[0];
    }
  }

  private static categorizeEvent(title: string, description?: string): string {
    const text = `${title} ${description || ""}`.toLowerCase();

    if (text.includes("конференция") || text.includes("conference"))
      return "conference";
    if (text.includes("семинар") || text.includes("seminar")) return "seminar";
    if (text.includes("лекция") || text.includes("lecture")) return "lecture";
    if (text.includes("защита") || text.includes("defense")) return "defense";
    if (text.includes("совещание") || text.includes("meeting"))
      return "meeting";
    if (text.includes("выставка") || text.includes("exhibition"))
      return "exhibition";

    return "other";
  }

  // Демо-данные для случая, когда парсинг не работает
  private static getDemoEvents(): JinrEvent[] {
    const today = new Date();
    const events: JinrEvent[] = [];

    const demoEventsData = [
      {
        title: "Семинар по ядерной физике",
        location: "Конференц-зал ЛЯР",
        description:
          "Обсуждение новых результатов исследований в области ядерной физики и ядерных реакций",
        category: "seminar",
      },
      {
        title: "Международная конференция по физике высоких энергий",
        location: "Актовый зал",
        description:
          "Международная конференция с участием ведущих специалистов из разных стран",
        category: "conference",
      },
      {
        title: "Лекция: Квантовые вычисления и их применение",
        location: "Лекционный зал ЛТФ",
        description:
          "Лекция о современных достижениях в области квантовых вычислений",
        category: "lecture",
      },
      {
        title: "Защита диссертации",
        location: "Учёный совет",
        description:
          "Защита кандидатской диссертации по теме физики элементарных частиц",
        category: "defense",
      },
      {
        title: "Рабочее совещание лаборатории",
        location: "ЛВЭ",
        description:
          "Планерное совещание сотрудников лаборатории высоких энергий",
        category: "meeting",
      },
      {
        title: "Семинар по теоретической физике",
        location: "ЛТФ, конференц-зал",
        description: "Еженедельный семинар лаборатории теоретической физики",
        category: "seminar",
      },
      {
        title: "Презентация научных результатов",
        location: "Зал заседаний дирекции",
        description: "Презентация результатов исследований молодых учёных",
        category: "other",
      },
      {
        title: "Методический семинар",
        location: "ЛНФ",
        description:
          "Семинар по новым методам детектирования в физике нейтронов",
        category: "seminar",
      },
    ];

    for (let i = 0; i < Math.min(demoEventsData.length, 15); i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i * 2); // События через день

      const demoData = demoEventsData[i % demoEventsData.length];
      const timeHour = 10 + (i % 6); // Время с 10:00 до 15:00

      events.push({
        id: `demo_event_${i}`,
        title: demoData.title,
        date: eventDate.toISOString().split("T")[0],
        time: `${timeHour}:00`,
        location: demoData.location,
        description: demoData.description,
        category: demoData.category,
        url: `https://www.jinr.ru/agenda/event/${i + 1}`,
      });
    }

    return events;
  }
}

// Функция для получения событий с кэшированием
export async function getJinrEvents(): Promise<JinrEvent[]> {
  // Проверяем, что мы в браузере
  const isBrowser = typeof window !== "undefined";

  const cacheKey = "jinr_events_cache";
  const cacheTimeKey = "jinr_events_cache_time";
  const cacheTimeout = 60 * 60 * 1000; // 1 час

  try {
    // Проверяем кэш только в браузере
    if (isBrowser) {
      try {
        const cachedEvents = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);

        if (cachedEvents && cacheTime) {
          const timeDiff = Date.now() - Number.parseInt(cacheTime);
          if (timeDiff < cacheTimeout) {
            console.log("Returning cached events");
            return JSON.parse(cachedEvents);
          }
        }
      } catch (cacheError) {
        console.warn("Error reading from cache:", cacheError);
      }
    }

    console.log("Fetching fresh events data...");

    // Загружаем новые события
    const events = await EventsParser.fetchEvents();

    // Сохраняем в кэш только в браузере
    if (isBrowser) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(events));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
        console.log("Events cached successfully");
      } catch (cacheError) {
        console.warn("Error saving to cache:", cacheError);
      }
    }

    return events;
  } catch (error) {
    console.error("Error getting JINR events:", error);

    // Возвращаем кэшированные данные в случае ошибки (только в браузере)
    if (isBrowser) {
      try {
        const cachedEvents = localStorage.getItem(cacheKey);
        if (cachedEvents) {
          console.log("Returning cached events due to fetch error");
          return JSON.parse(cachedEvents);
        }
      } catch (cacheError) {
        console.warn("Error reading cached events:", cacheError);
      }
    }

    // Возвращаем демо-данные как последний вариант
    console.log("Returning demo events as fallback");
    return EventsParser.getDemoEvents();
  }
}
