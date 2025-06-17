// Модуль для работы с локальной базой данных через IndexedDB
import type { POI } from "@/types/poi";
import type { NewsItem } from "@/types/news";
import type { MediaItem, Album } from "@/types/media";
import type { SystemSettings } from "@/types/settings";

// Имя базы данных
const DB_NAME = "interactive_map_db";
const DB_VERSION = 3;

// Имена хранилищ (таблиц)
const STORES = {
  POIS: "pois",
  NEWS: "news",
  MEDIA: "media",
  ALBUMS: "albums",
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

// Переменная для кеширования инициализированной базы данных
let dbCache: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;
let dbInitFailed = false;

// Инициализация базы данных
export async function initDB(): Promise<IDBDatabase> {
  if (dbCache) {
    return dbCache;
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  if (dbInitFailed) {
    throw new Error("IndexedDB недоступна - используйте fallback данные");
  }

  if (typeof window === "undefined" || !window.indexedDB) {
    dbInitFailed = true;
    throw new Error("IndexedDB не поддерживается в этом браузере");
  }

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    const timeout = setTimeout(() => {
      reject(new Error("Таймаут инициализации базы данных"));
    }, 10000);

    request.onerror = () => {
      clearTimeout(timeout);
      const errorMessage = request.error?.message || "Неизвестная ошибка";
      console.error("Ошибка открытия базы данных:", errorMessage);
      reject(new Error(`Не удалось открыть базу данных: ${errorMessage}`));
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      const db = request.result;

      db.onerror = (event) => console.error("Ошибка базы данных:", event);
      db.onclose = () => {
        console.warn("База данных была закрыта");
        dbCache = null;
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      console.log(
        `Обновление базы данных с версии ${event.oldVersion} до ${event.newVersion}`,
      );

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
        mediaStore.createIndex("category", "category", { unique: false });
        mediaStore.createIndex("albumId", "albumId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ALBUMS)) {
        const albumsStore = db.createObjectStore(STORES.ALBUMS, {
          keyPath: "id",
        });
        albumsStore.createIndex("type", "type", { unique: false });
        albumsStore.createIndex("createdAt", "createdAt", { unique: false });
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
    };

    request.onblocked = () => {
      clearTimeout(timeout);
      reject(new Error("База данных заблокирована другой вкладкой"));
    };
  });

  try {
    const db = await dbInitPromise;
    dbCache = db;
    dbInitPromise = null;

    // Добавляем базовые данные если нужно
    addBasicDataIfNeeded(db).catch(console.warn);

    return db;
  } catch (error) {
    dbInitPromise = null;
    dbInitFailed = true;
    throw error;
  }
}

// Функция для сброса состояния БД
export function resetDBState(): void {
  dbCache = null;
  dbInitPromise = null;
  dbInitFailed = false;
  console.log("Состояние базы данных сброшено");
}

// Функция для проверки состояния базы данных
export function getDBStatus() {
  return {
    hasCache: !!dbCache,
    hasInitPromise: !!dbInitPromise,
    initFailed: dbInitFailed,
    supported: typeof window !== "undefined" && !!window.indexedDB,
  };
}

// Добавление базовых данных
async function addBasicDataIfNeeded(db: IDBDatabase): Promise<void> {
  try {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.count();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result === 0) {
          console.log("Добавляем базовые данные...");
          addBasicData(db)
            .catch(console.warn)
            .finally(() => resolve());
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve();
    });
  } catch (error) {
    console.warn("Ошибка при проверке данных:", error);
  }
}

async function addBasicData(db: IDBDatabase): Promise<void> {
  const transaction = db.transaction(
    [STORES.POIS, STORES.SETTINGS, STORES.RSS_FEEDS, STORES.ALBUMS],
    "readwrite",
  );

  try {
    // Добавляем базовый POI
    const poisStore = transaction.objectStore(STORES.POIS);
    poisStore.add({
      id: "1",
      name: "ОИЯИ",
      shortDescription: "Главное здание института",
      fullDescription: "Объединенный институт ядерных исследований",
      coordinates: [56.7458, 37.189],
      images: [],
      address: "ул. Жолио-Кюри, 6, Дубна",
      category: "building",
    });

    // Добавляем базовые настройки
    const settingsStore = transaction.objectStore(STORES.SETTINGS);
    settingsStore.add({
      id: "system_settings",
      idleTimeout: 300000,
      loadingGif: "/placeholder.svg",
      organizationInfo: {
        name: "ОИЯИ",
        fullName: "Объединенный институт ядерных исследований",
        logo: "/images/jinr-logo.png",
        description: "Международная научно-исследовательская организация",
        address: "ул. Жолио-Кюри, 6, Дубна",
        phone: "+7 (496) 216-50-59",
        email: "post@jinr.ru",
        website: "http://www.jinr.ru",
      },
    });

    // Добавляем RSS ленту
    const rssStore = transaction.objectStore(STORES.RSS_FEEDS);
    rssStore.add({
      id: "1",
      name: "Naked Science",
      url: "https://naked-science.ru/article/category/sci/feed",
      active: true,
    });

    // Добавляем базовые альбомы
    const albumsStore = transaction.objectStore(STORES.ALBUMS);
    albumsStore.add({
      id: "1",
      name: "Общие фотографии",
      description: "Основная коллекция фотографий ОИЯИ",
      type: "photo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    });

    albumsStore.add({
      id: "2",
      name: "Видеомат��риалы",
      description: "Видео презентации и документальные материалы",
      type: "video",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    });

    console.log("Базовые данные добавлены");
  } catch (error) {
    console.warn("Ошибка добавления базовых данных:", error);
  }
}

// Функции для работы с POI
export async function getAllPOIs(): Promise<POI[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить POI"));
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

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(new Error("Не удалось получить POI по категории"));
  });
}

export async function getPOIById(id: string): Promise<POI | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readonly");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Не удалось получить POI"));
  });
}

export async function savePOI(poi: POI): Promise<POI> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readwrite");
    const store = transaction.objectStore(STORES.POIS);

    if (!poi.id) {
      poi.id = Date.now().toString();
    }

    const request = store.put(poi);

    request.onsuccess = () => resolve(poi);
    request.onerror = () => reject(new Error("Не удалось сохранить POI"));
  });
}

export async function deletePOI(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.POIS, "readwrite");
    const store = transaction.objectStore(STORES.POIS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(new Error("Не удалось удалить POI"));
  });
}

// Функции для работы с новостями
export async function getAllNews(): Promise<NewsItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readonly");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить новости"));
  });
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readonly");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Не удалось получить новость"));
  });
}

export async function saveNews(news: NewsItem): Promise<NewsItem> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readwrite");
    const store = transaction.objectStore(STORES.NEWS);

    if (!news.id) {
      news.id = Date.now().toString();
    }

    const request = store.put(news);

    request.onsuccess = () => resolve(news);
    request.onerror = () => reject(new Error("Не удалось сохранить новость"));
  });
}

export async function deleteNews(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NEWS, "readwrite");
    const store = transaction.objectStore(STORES.NEWS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(new Error("Не удалось удалить новость"));
  });
}

// Функции для работы с настройками
export async function getSettings(): Promise<SystemSettings | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, "readonly");
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get("system_settings");

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Не удалось получить настройки"));
  });
}

export async function saveSettings(
  settings: SystemSettings,
): Promise<SystemSettings> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, "readwrite");
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.put(settings);

    request.onsuccess = () => resolve(settings);
    request.onerror = () => reject(new Error("Не удалось сохранить настройки"));
  });
}

// RSS функции
export async function getAllRssFeeds(): Promise<RssFeed[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readonly");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить RSS-ленты"));
  });
}

export async function getActiveRssFeeds(): Promise<RssFeed[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readonly");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.getAll();

    request.onsuccess = () => {
      const allFeeds = request.result || [];
      const activeFeeds = allFeeds.filter((feed) => feed.active === true);
      resolve(activeFeeds);
    };

    request.onerror = () =>
      reject(new Error("Не удалось получить активные RSS-ленты"));
  });
}

export async function saveRssFeed(feed: RssFeed): Promise<RssFeed> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readwrite");
    const store = transaction.objectStore(STORES.RSS_FEEDS);

    if (!feed.id) {
      feed.id = Date.now().toString();
    }

    const request = store.put(feed);

    request.onsuccess = () => resolve(feed);
    request.onerror = () => reject(new Error("Не удалось сохранить RSS-ленту"));
  });
}

export async function deleteRssFeed(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.RSS_FEEDS, "readwrite");
    const store = transaction.objectStore(STORES.RSS_FEEDS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(new Error("Не удалось удалить RSS-ленту"));
  });
}

// Функции для работы с медиафайлами
export async function getAllMedia(): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить медиафайлы"));
  });
}

export async function getMediaByType(type: string): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const index = store.index("type");
    const request = index.getAll(type);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(new Error("Не удалось получить медиафайлы по типу"));
  });
}

export async function getMediaByCategory(
  category: "photo" | "video",
): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const index = store.index("category");
    const request = index.getAll(category);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(new Error("Не удалось получить медиафайлы по категории"));
  });
}

export async function getMediaByAlbum(albumId: string): Promise<MediaItem[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDIA, "readonly");
    const store = transaction.objectStore(STORES.MEDIA);
    const index = store.index("albumId");
    const request = index.getAll(albumId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(new Error("Не удалось получить медиафайлы альбома"));
  });
}

export async function saveMedia(media: MediaItem): Promise<MediaItem> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.MEDIA, STORES.ALBUMS],
      "readwrite",
    );
    const store = transaction.objectStore(STORES.MEDIA);

    if (!media.id) {
      media.id = Date.now().toString();
    }

    if (!media.date) {
      media.date = new Date().toISOString();
    }

    const request = store.put(media);

    request.onsuccess = async () => {
      // Обновляем счетчик альбома
      if (media.albumId) {
        try {
          await updateAlbumItemCount(media.albumId);
        } catch (error) {
          console.warn("Не удалось обновить счетчик альбома:", error);
        }
      }
      resolve(media);
    };

    request.onerror = () => reject(new Error("Не удалось сохранить медиафайл"));
  });
}

export async function deleteMedia(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.MEDIA, STORES.ALBUMS],
      "readwrite",
    );
    const store = transaction.objectStore(STORES.MEDIA);

    // Сначала получаем медиафайл для получения albumId
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const media = getRequest.result;
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = async () => {
        // Обновляем счетчик альбома
        if (media?.albumId) {
          try {
            await updateAlbumItemCount(media.albumId);
          } catch (error) {
            console.warn("Не удалось обновить счетчик альбома:", error);
          }
        }
        resolve(true);
      };

      deleteRequest.onerror = () =>
        reject(new Error("Не удалось удалить медиафайл"));
    };

    getRequest.onerror = () => reject(new Error("Не удалось найти медиафайл"));
  });
}

// Функции для работы с альбомами
export async function getAllAlbums(): Promise<Album[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, "readonly");
    const store = transaction.objectStore(STORES.ALBUMS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить альбомы"));
  });
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, "readonly");
    const store = transaction.objectStore(STORES.ALBUMS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Не удалось получить альбом"));
  });
}

export async function saveAlbum(album: Album): Promise<Album> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, "readwrite");
    const store = transaction.objectStore(STORES.ALBUMS);

    if (!album.id) {
      album.id = Date.now().toString();
    }

    if (!album.createdAt) {
      album.createdAt = new Date().toISOString();
    }

    album.updatedAt = new Date().toISOString();

    const request = store.put(album);

    request.onsuccess = () => resolve(album);
    request.onerror = () => reject(new Error("Не удалось сохранить альбом"));
  });
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.ALBUMS, STORES.MEDIA],
      "readwrite",
    );
    const albumsStore = transaction.objectStore(STORES.ALBUMS);
    const mediaStore = transaction.objectStore(STORES.MEDIA);
    const mediaIndex = mediaStore.index("albumId");

    // Сначала удаляем все медиафайлы из альбома
    const mediaRequest = mediaIndex.getAll(id);

    mediaRequest.onsuccess = () => {
      const mediaItems = mediaRequest.result || [];

      // Удаляем все медиафайлы
      mediaItems.forEach((media) => {
        mediaStore.delete(media.id);
      });

      // Затем удаляем сам альбом
      const albumRequest = albumsStore.delete(id);

      albumRequest.onsuccess = () => resolve(true);
      albumRequest.onerror = () =>
        reject(new Error("Не удалось удалить альбом"));
    };

    mediaRequest.onerror = () =>
      reject(new Error("Не удалось получить медиафайлы альбома"));
  });
}

// Вспомогательная функция для обновления счетчика элементов в альбоме
async function updateAlbumItemCount(albumId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.ALBUMS, STORES.MEDIA],
      "readwrite",
    );
    const albumsStore = transaction.objectStore(STORES.ALBUMS);
    const mediaStore = transaction.objectStore(STORES.MEDIA);
    const mediaIndex = mediaStore.index("albumId");

    const albumRequest = albumsStore.get(albumId);

    albumRequest.onsuccess = () => {
      const album = albumRequest.result;
      if (!album) {
        reject(new Error("Альбом не найден"));
        return;
      }

      const countRequest = mediaIndex.count(albumId);

      countRequest.onsuccess = () => {
        album.itemCount = countRequest.result;
        album.updatedAt = new Date().toISOString();

        const updateRequest = albumsStore.put(album);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () =>
          reject(new Error("Не удалось обновить альбом"));
      };

      countRequest.onerror = () =>
        reject(new Error("Не удалось подсчитать элементы"));
    };

    albumRequest.onerror = () =>
      reject(new Error("Не удалось получить альбом"));
  });
}
// Функции для работы с иконками
export async function getAllIcons(): Promise<MarkerIcon[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readonly");
    const store = transaction.objectStore(STORES.ICONS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Не удалось получить иконки"));
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

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(new Error("Не удалось получить иконки по категории"));
  });
}

export async function saveIcon(icon: MarkerIcon): Promise<MarkerIcon> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readwrite");
    const store = transaction.objectStore(STORES.ICONS);

    if (!icon.id) {
      icon.id = Date.now().toString();
    }

    const request = store.put(icon);

    request.onsuccess = () => resolve(icon);
    request.onerror = () => reject(new Error("Не удалось сохранить иконку"));
  });
}

export async function deleteIcon(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ICONS, "readwrite");
    const store = transaction.objectStore(STORES.ICONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(new Error("Не удалось удалить иконку"));
  });
}

// Функция для загрузки файлов (создает blob URL)
export async function uploadFile(file: File): Promise<string> {
  return URL.createObjectURL(file);
}
