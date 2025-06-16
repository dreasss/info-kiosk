// Модуль для работы с локальной базой данных через IndexedDB
import type { POI } from "@/types/poi";
import type { NewsItem } from "@/types/news";
import type { MediaItem } from "@/types/media";
import type { SystemSettings } from "@/types/settings";

// Имя базы данных
const DB_NAME = "interactive_map_db";
const DB_VERSION = 1;

// Имена хранилищ (таблиц)
const STORES = {
  POIS: "pois",
  NEWS: "news",
  MEDIA: "media",
  SETTINGS: "settings",
  ICONS: "icons",
  RSS_FEEDS: "rss_feeds",
};

// Интерфейс для иконок маркеров
export interface MarkerIcon {
  id: string;
  name: string;
  category: string;
  url: string;
  blob?: Blob;
}

// Интерфейс для RSS-лент
export interface RssFeed {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

// Инициализация базы данных
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Ошибка открытия базы данных:", event);
      reject(new Error("Не удалось открыть базу данных"));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;

      // Создаем хранилища, если их нет
      if (!db.objectStoreNames.contains(STORES.POIS)) {
        const poisStore = db.createObjectStore(STORES.POIS, { keyPath: "id" });
        poisStore.createIndex("category", "category", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.NEWS)) {
        const newsStore = db.createObjectStore(STORES.NEWS, { keyPath: "id" });
        newsStore.createIndex("date", "date", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.MEDIA)) {
        const mediaStore = db.createObjectStore(STORES.MEDIA, {
          keyPath: "id",
        });
        mediaStore.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.ICONS)) {
        const iconsStore = db.createObjectStore(STORES.ICONS, {
          keyPath: "id",
        });
        iconsStore.createIndex("category", "category", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.RSS_FEEDS)) {
        const rssStore = db.createObjectStore(STORES.RSS_FEEDS, {
          keyPath: "id",
        });
        rssStore.createIndex("active", "active", { unique: false });
      }

      // Инициализируем базу данными по умолчанию используя текущую транзакцию
      initializeDefaultData(transaction);
    };
  });
}

// Инициализация базы данных демо-данными
function initializeDefaultData(transaction: IDBTransaction) {
  // Демо-данные для POI
  const demoPOIs: POI[] = [
    {
      id: "1",
      name: "Объединенный институт ядерных исследований",
      shortDescription:
        "Международный научный центр, проводящий фундаментальные исследования.",
      fullDescription:
        "Объединенный институт ядерных исследований (ОИЯИ) — международная межправительственная научно-исследовательская организация, расположенная в Дубне. Институт специализируется на исследован��ях в области ядерной физики, физики элементарных частиц и конденсированных сред.",
      coordinates: [56.7458, 37.189],
      images: [
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
      ],
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
      shortDescription:
        "Исследовательская лаборатория, специализирующаяся на синтезе новых элементов.",
      fullDescription:
        "Лаборатория ядерных реакций им. Г.Н. Флерова — одна из ведущих лабораторий ОИЯИ, где были синтезированы многие сверхтяжелые элементы таблицы Менделеева. Здесь находятся уникальные ускорители тяжелых ионов, позволяющие проводить эксперименты мирового уровня.",
      coordinates: [56.744, 37.187],
      images: [
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
      ],
      address: "ул. Жолио-Кюри, 4, Дубна, Московская область",
      category: "building",
    },
  ];

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
  ];

  // Демо-данные для RSS-лент
  const demoRssFeeds: RssFeed[] = [
    {
      id: "1",
      name: "Naked Science",
      url: "https://naked-science.ru/article/category/sci/feed",
      active: true,
    },
  ];

  // Настройки системы по умолчанию
  const defaultSettings: SystemSettings = {
    id: "system_settings",
    idleTimeout: 5 * 60 * 1000, // 5 минут
    loadingGif: "/placeholder.svg?height=400&width=600",
    organizationInfo: {
      name: "ОИЯИ",
      fullName: "Объединенный институт ядерных исследований",
      logo: "/images/jinr-logo.png",
      description:
        "Международная межправительственная научно-исследовательская организация",
      address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
      phone: "+7 (496) 216-50-59",
      email: "post@jinr.ru",
      website: "http://www.jinr.ru",
    },
  };

  // Добавляем демо-данные в базу используя существующую транзакцию
  try {
    const poisStore = transaction.objectStore(STORES.POIS);
    demoPOIs.forEach((poi) => {
      poisStore.add(poi);
    });

    const newsStore = transaction.objectStore(STORES.NEWS);
    demoNews.forEach((news) => {
      newsStore.add(news);
    });

    const rssStore = transaction.objectStore(STORES.RSS_FEEDS);
    demoRssFeeds.forEach((feed) => {
      rssStore.add(feed);
    });

    const settingsStore = transaction.objectStore(STORES.SETTINGS);
    settingsStore.add(defaultSettings);
  } catch (error) {
    console.error("Ошибка инициализации демо-данных:", error);
  }
}

// Функции для работы с POI
export async function getAllPOIs(): Promise<POI[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения POI:", event);
      reject(new Error("Не удалось получить POI"));
    };
  });
}

export async function getPOIsByCategory(category: string): Promise<POI[]> {
  if (category === "all") {
    return getAllPOIs();
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const index = store.index("category");
    const request = index.getAll(category);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения POI по категории:", event);
      reject(new Error("Не удалось получить POI по категории"));
    };
  });
}

export async function getPOIById(id: string): Promise<POI | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения POI по ID:", event);
      reject(new Error("Не удалось получить POI по ID"));
    };
  });
}

export async function savePOI(poi: POI): Promise<POI> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readwrite");
    const store = transaction.objectStore(STORES.POIS);

    // Если ID не указан, генерируем новый
    if (!poi.id) {
      poi.id = Date.now().toString();
    }

    const request = store.put(poi);

    request.onsuccess = () => {
      resolve(poi);
    };

    request.onerror = (event) => {
      console.error("Ошибк�� сохранения POI:", event);
      reject(new Error("Не удалось сохранить POI"));
    };
  });
}

export async function deletePOI(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readwrite");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Ошибка удаления POI:", event);
      reject(new Error("Не удалось удалить POI"));
    };
  });
}

// Функции для работы с новостями
export async function getAllNews(): Promise<NewsItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readonly");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.getAll();

    request.onsuccess = () => {
      // Сортируем новости по дате (сначала новые)
      const news = request.result.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      resolve(news);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения новостей:", event);
      reject(new Error("Не удалось получить новости"));
    };
  });
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readonly");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения новости по ID:", event);
      reject(new Error("Не удалось получить новость по ID"));
    };
  });
}

export async function saveNews(news: NewsItem): Promise<NewsItem> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readwrite");
    const store = transaction.objectStore(STORES.NEWS);

    // Если ID не указан, генерируем новый
    if (!news.id) {
      news.id = Date.now().toString();
    }

    const request = store.put(news);

    request.onsuccess = () => {
      resolve(news);
    };

    request.onerror = (event) => {
      console.error("Ошибка сохранения новости:", event);
      reject(new Error("Не удалось сохранить новость"));
    };
  });
}

export async function deleteNews(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readwrite");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Ошибка удаления новости:", event);
      reject(new Error("Не удалось удалить новость"));
    };
  });
}

// Функции для работы с медиафайлами
export async function getAllMedia(): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения медиафайлов:", event);
      reject(new Error("Не удалось получить м��диафайлы"));
    };
  });
}

export async function getMediaByType(type: string): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const index = store.index("type");
    const request = index.getAll(type);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения медиафайлов по типу:", event);
      reject(new Error("Не удалось получить медиафайлы по типу"));
    };
  });
}

export async function saveMedia(media: MediaItem): Promise<MediaItem> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readwrite");
    const store = transaction.objectStore(STORES.MEDIA);

    // Если ID не указан, генерируем новый
    if (!media.id) {
      media.id = Date.now().toString();
    }

    const request = store.put(media);

    request.onsuccess = () => {
      resolve(media);
    };

    request.onerror = (event) => {
      console.error("Ошибка сохранения медиафайла:", event);
      reject(new Error("Не удалось сохранить медиафайл"));
    };
  });
}

export async function deleteMedia(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readwrite");
    const store = transaction.objectStore(STORES.MEDIA);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Ошибка удаления медиафайла:", event);
      reject(new Error("Не удалось удалить медиафайл"));
    };
  });
}

// Функции для работы с настройками
export async function getSettings(): Promise<SystemSettings | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, "readonly");
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get("system_settings");

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения настроек:", event);
      reject(new Error("Не удалось получить настройки"));
    };
  });
}

export async function saveSettings(
  settings: SystemSettings,
): Promise<SystemSettings> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, "readwrite");
    const store = transaction.objectStore(STORES.SETTINGS);

    // Устанавливаем ID настроек
    settings.id = "system_settings";

    const request = store.put(settings);

    request.onsuccess = () => {
      resolve(settings);
    };

    request.onerror = (event) => {
      console.error("Ошибка сохранения настроек:", event);
      reject(new Error("Не удалось сохранить настройки"));
    };
  });
}

// Функции для работы с иконками маркеров
export async function getAllIcons(): Promise<MarkerIcon[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readonly");
    const store = transaction.objectStore(STORES.ICONS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения иконок:", event);
      reject(new Error("Не удалось получить иконки"));
    };
  });
}

export async function getIconsByCategory(
  category: string,
): Promise<MarkerIcon[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readonly");
    const store = transaction.objectStore(STORES.ICONS);
    const index = store.index("category");
    const request = index.getAll(category);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения иконок по категории:", event);
      reject(new Error("Не удалось получить иконки по категории"));
    };
  });
}

export async function saveIcon(
  icon: MarkerIcon,
  iconBlob?: Blob,
): Promise<MarkerIcon> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readwrite");
    const store = transaction.objectStore(STORES.ICONS);

    // Если ID не указан, генерируем новый
    if (!icon.id) {
      icon.id = Date.now().toString();
    }

    // Если передан Blob, сохраняем его
    if (iconBlob) {
      icon.blob = iconBlob;

      // Создаем URL для Blob
      icon.url = URL.createObjectURL(iconBlob);
    }

    const request = store.put(icon);

    request.onsuccess = () => {
      resolve(icon);
    };

    request.onerror = (event) => {
      console.error("Ошибка сохранения иконки:", event);
      reject(new Error("Не удалось сохранить иконку"));
    };
  });
}

export async function deleteIcon(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readwrite");
    const store = transaction.objectStore(STORES.ICONS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Ошибка удаления иконки:", event);
      reject(new Error("Не удалось удалить иконку"));
    };
  });
}

// Функции для работы с RSS-лентами
export async function getAllRssFeeds(): Promise<RssFeed[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readonly");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения RSS-лент:", event);
      reject(new Error("Не удалось получить RSS-ленты"));
    };
  });
}

export async function getActiveRssFeeds(): Promise<RssFeed[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readonly");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.getAll();

    request.onsuccess = () => {
      // Фильтруем активные ленты вручную
      const allFeeds = request.result || [];
      const activeFeeds = allFeeds.filter((feed) => feed.active === true);
      resolve(activeFeeds);
    };

    request.onerror = (event) => {
      console.error("Ошибка получения активных RSS-лент:", event);
      reject(new Error("Не удалось получить активные RSS-ленты"));
    };
  });
}

export async function saveRssFeed(feed: RssFeed): Promise<RssFeed> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readwrite");
    const store = transaction.objectStore(STORES.RSS_FEEDS);

    // Если ID не указан, генерируем новый
    if (!feed.id) {
      feed.id = Date.now().toString();
    }

    const request = store.put(feed);

    request.onsuccess = () => {
      resolve(feed);
    };

    request.onerror = (event) => {
      console.error("Ошибка сохранения RSS-ленты:", event);
      reject(new Error("Не удалось сохранить RSS-ленту"));
    };
  });
}

export async function deleteRssFeed(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readwrite");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Ошибка удаления RSS-ленты:", event);
      reject(new Error("Не удалось удалить RSS-ленту"));
    };
  });
}

// Функция для загрузки файла и сохранения его в базе данных
export async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        // Создаем Blob из содержимого файла
        const blob = new Blob([event.target.result], { type: file.type });

        // Создаем URL для Blob
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        reject(new Error("Не удалось прочитать файл"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Ошибка чтения файла"));
    };

    reader.readAsArrayBuffer(file);
  });
}
