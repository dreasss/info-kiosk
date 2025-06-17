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
  getMediaByCategory,
  getMediaByAlbum,
  saveMedia,
  deleteMedia,
  getAllAlbums,
  getAlbumById,
  saveAlbum,
  deleteAlbum,
  getSettings,
  saveSettings,
  getAllRssFeeds,
  getActiveRssFeeds,
  saveRssFeed,
  deleteRssFeed,
  getAllIcons,
  getIconsByCategory,
  saveIcon,
  deleteIcon,
  uploadFile,
  type RssFeed,
  type MarkerIcon,
} from "@/lib/db";

import type { POI, POICategory } from "@/types/poi";
import type { NewsItem } from "@/types/news";
import type { MediaItem, Album } from "@/types/media";
import type { SystemSettings, OrganizationInfo } from "@/types/settings";
import { ROUTE_CONFIG } from "@/lib/config";

// Проверка доступности браузерного API
const isBrowser = typeof window !== "undefined";

// API для работы с POI
export async function fetchPOIs(): Promise<POI[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllPOIs();
  } catch (error) {
    console.error("Error fetching POIs:", error);
    // Возвращаем fallback данные при ошибке базы данных
    return [
      {
        id: "fallback_1",
        name: "Главное здание ОИЯИ",
        shortDescription: "Основное административное здание института",
        fullDescription:
          "Главное здание Объединенного института ядерных исследований, где располагается администрация и основные научные подразделения.",
        coordinates: [56.7458, 37.189] as [number, number],
        images: [],
        address: "ул. Жолио-Кюри, 6, Дубна",
        category: "building" as const,
      },
    ];
  }
}

export async function fetchPOIsByCategory(
  category: POICategory | "all",
): Promise<POI[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getPOIsByCategory(category);
  } catch (error) {
    console.error("Error fetching POIs by category:", error);
    return [];
  }
}

export async function fetchPOIById(id: string): Promise<POI | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    return await getPOIById(id);
  } catch (error) {
    console.error("Error fetching POI by ID:", error);
    return null;
  }
}

export async function createPOI(poi: Omit<POI, "id">): Promise<POI> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    return await savePOI(poi as POI);
  } catch (error) {
    console.error("Error creating POI:", error);
    throw error;
  }
}

export async function updatePOI(
  id: string,
  poi: Partial<POI>,
): Promise<POI | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    const existingPOI = await getPOIById(id);
    if (!existingPOI) return null;

    const updatedPOI = { ...existingPOI, ...poi };
    return await savePOI(updatedPOI);
  } catch (error) {
    console.error("Error updating POI:", error);
    throw error;
  }
}

export async function removePOI(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deletePOI(id);
  } catch (error) {
    console.error("Error deleting POI:", error);
    throw error;
  }
}

// API для работы с новостями
export async function fetchNews(): Promise<NewsItem[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllNews();
  } catch (error) {
    console.error("Error fetching news:", error);
    // Возвращаем fallback данные при ошибке базы данных
    return [
      {
        id: "fallback_news_1",
        title: "Добро пожаловать в информационную систему ОИЯИ",
        content:
          "Система временно работает в автономном режиме. Пожалуйста, обновите страницу для полной функциональности.",
        date: new Date().toISOString(),
        image: "",
        url: "",
      },
    ];
  }
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    return await getNewsById(id);
  } catch (error) {
    console.error("Error fetching news by ID:", error);
    return null;
  }
}

export async function createNews(
  newsItem: Omit<NewsItem, "id">,
): Promise<NewsItem> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    return await saveNews(newsItem as NewsItem);
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
}

export async function updateNews(
  id: string,
  newsItem: Partial<NewsItem>,
): Promise<NewsItem | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    const existingNews = await getNewsById(id);
    if (!existingNews) return null;

    const updatedNews = { ...existingNews, ...newsItem };
    return await saveNews(updatedNews);
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
}

export async function removeNews(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteNews(id);
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
}

// API для работы с медиафайлами
export async function fetchMedia(): Promise<MediaItem[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllMedia();
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}

export async function fetchMediaByType(type: string): Promise<MediaItem[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getMediaByType(type);
  } catch (error) {
    console.error("Error fetching media by type:", error);
    return [];
  }
}

export async function fetchMediaByCategory(
  category: "photo" | "video",
): Promise<MediaItem[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getMediaByCategory(category);
  } catch (error) {
    console.error("Error fetching media by category:", error);
    return [];
  }
}

export async function fetchMediaByAlbum(albumId: string): Promise<MediaItem[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getMediaByAlbum(albumId);
  } catch (error) {
    console.error("Error fetching media by album:", error);
    return [];
  }
}

export async function createMediaItem(
  media: Omit<MediaItem, "id" | "date">,
): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Cannot create media item on server side");
  }

  try {
    const fullMedia: MediaItem = {
      ...media,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    return await saveMedia(fullMedia);
  } catch (error) {
    console.error("Error creating media item:", error);
    throw error;
  }
}

export async function updateMediaItem(media: MediaItem): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Cannot update media item on server side");
  }

  try {
    return await saveMedia(media);
  } catch (error) {
    console.error("Error updating media item:", error);
    throw error;
  }
}

export async function removeMediaItem(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteMedia(id);
  } catch (error) {
    console.error("Error removing media item:", error);
    return false;
  }
}

// API функции для работы с альбомами
export async function fetchAlbums(): Promise<Album[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllAlbums();
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

export async function fetchAlbumById(id: string): Promise<Album | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    return await getAlbumById(id);
  } catch (error) {
    console.error("Error fetching album:", error);
    return null;
  }
}

export async function createAlbum(
  album: Omit<Album, "id" | "createdAt" | "updatedAt">,
): Promise<Album> {
  if (!isBrowser) {
    throw new Error("Cannot create album on server side");
  }

  try {
    const fullAlbum: Album = {
      ...album,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    };
    return await saveAlbum(fullAlbum);
  } catch (error) {
    console.error("Error creating album:", error);
    throw error;
  }
}

export async function updateAlbum(album: Album): Promise<Album> {
  if (!isBrowser) {
    throw new Error("Cannot update album on server side");
  }

  try {
    return await saveAlbum(album);
  } catch (error) {
    console.error("Error updating album:", error);
    throw error;
  }
}

export async function removeAlbum(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteAlbum(id);
  } catch (error) {
    console.error("Error removing album:", error);
    return false;
  }
}

// Улучшенная функция загрузки файлов с поддержкой превью
export async function uploadMediaFile(
  file: File,
  albumId?: string,
  description?: string,
): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Cannot upload file on server side");
  }

  try {
    // Создаем URL для файла
    const url = URL.createObjectURL(file);

    // Определяем тип и категорию файла
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      throw new Error("Поддерживаются только изображения и видео файлы");
    }

    // Получаем размеры для изображений
    let dimensions: { width: number; height: number } | undefined;
    let thumbnail: string | undefined;

    if (isImage) {
      dimensions = await getImageDimensions(file);
      thumbnail = url; // Для изображений превью = само изображение
    } else if (isVideo) {
      thumbnail = await generateVideoThumbnail(file);
    }

    const mediaItem: Omit<MediaItem, "id" | "date"> = {
      title: file.name.split(".").slice(0, -1).join("."), // Убираем расширение
      description: description || "",
      type: isImage ? "image" : "video",
      category: isImage ? "photo" : "video",
      url: url,
      thumbnail: thumbnail,
      albumId: albumId,
      fileSize: file.size,
      dimensions: dimensions,
      tags: [],
    };

    if (isVideo) {
      mediaItem.duration = await getVideoDuration(file);
    }

    return await createMediaItem(mediaItem);
  } catch (error) {
    console.error("Error uploading media file:", error);
    throw error;
  }
}

// Вспомогательные функции
async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = URL.createObjectURL(file);
  });
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(file);
  });
}

async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadeddata = () => {
      video.currentTime = 1; // Получаем кадр на 1 секунде
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(""); // Fallback
          }
        },
        "image/jpeg",
        0.7,
      );
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function createMedia(
  mediaItem: Omit<MediaItem, "id">,
): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    return await saveMedia(mediaItem as MediaItem);
  } catch (error) {
    console.error("Error creating media:", error);
    throw error;
  }
}

export async function updateMedia(
  id: string,
  mediaItem: Partial<MediaItem>,
): Promise<MediaItem | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    const existingMedia = await getMediaByType(id);
    if (!existingMedia || existingMedia.length === 0) return null;

    const updatedMedia = { ...existingMedia[0], ...mediaItem };
    return await saveMedia(updatedMedia as MediaItem);
  } catch (error) {
    console.error("Error updating media:", error);
    throw error;
  }
}

export async function removeMedia(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteMedia(id);
  } catch (error) {
    console.error("Error deleting media:", error);
    throw error;
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
      description:
        "Международная межправительственная научно-исследовательская организация",
      address: "ул. Жолио-Кюри, 6, Дубна, Московская область",
      phone: "+7 (496) 216-50-59",
      email: "post@jinr.ru",
      website: "http://www.jinr.ru",
    },
  };

  if (!isBrowser) {
    return defaultSettings;
  }

  try {
    const settings = await getSettings();
    return settings || defaultSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    console.warn("Using fallback settings due to database error");
    return defaultSettings;
  }
}

export async function updateSettings(
  settings: Partial<SystemSettings>,
): Promise<SystemSettings> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    const currentSettings = await fetchSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    return await saveSettings(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}

export async function updateOrganizationInfo(
  info: Partial<OrganizationInfo>,
): Promise<OrganizationInfo> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    const settings = await fetchSettings();
    const updatedInfo = { ...settings.organizationInfo, ...info };
    await updateSettings({ organizationInfo: updatedInfo });
    return updatedInfo;
  } catch (error) {
    console.error("Error updating organization info:", error);
    throw error;
  }
}

// API для работы с RSS лентами
export async function fetchRssFeeds(): Promise<RssFeed[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllRssFeeds();
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    return [];
  }
}

export async function fetchActiveRssFeeds(): Promise<RssFeed[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getActiveRssFeeds();
  } catch (error) {
    console.error("Error fetching active RSS feeds:", error);
    return [];
  }
}

export async function createRssFeed(
  feed: Omit<RssFeed, "id">,
): Promise<RssFeed> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    const newFeed: RssFeed = {
      ...feed,
      id: Date.now().toString(),
    };
    return await saveRssFeed(newFeed);
  } catch (error) {
    console.error("Error creating RSS feed:", error);
    throw error;
  }
}

export async function updateRssFeed(
  id: string,
  updates: Partial<RssFeed>,
): Promise<RssFeed | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    const feeds = await getAllRssFeeds();
    const existingFeed = feeds.find((f) => f.id === id);
    if (!existingFeed) return null;

    const updatedFeed = { ...existingFeed, ...updates };
    return await saveRssFeed(updatedFeed);
  } catch (error) {
    console.error("Error updating RSS feed:", error);
    throw error;
  }
}

export async function removeRssFeed(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteRssFeed(id);
  } catch (error) {
    console.error("Error removing RSS feed:", error);
    return false;
  }
}

// API для работы с иконками
export async function fetchIcons(): Promise<MarkerIcon[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getAllIcons();
  } catch (error) {
    console.error("Error fetching icons:", error);
    return [];
  }
}

export async function fetchIconsByCategory(
  category: string,
): Promise<MarkerIcon[]> {
  if (!isBrowser) {
    return [];
  }

  try {
    return await getIconsByCategory(category);
  } catch (error) {
    console.error("Error fetching icons by category:", error);
    return [];
  }
}

export async function createIcon(
  icon: Omit<MarkerIcon, "id">,
  iconFile?: File,
): Promise<MarkerIcon> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    const newIcon: MarkerIcon = {
      ...icon,
      id: Date.now().toString(),
    };

    if (iconFile) {
      // Загружаем файл и создаем Blob
      const url = await uploadFile(iconFile);
      newIcon.url = url;

      const blob = new Blob([await iconFile.arrayBuffer()], {
        type: iconFile.type,
      });
      return await saveIcon(newIcon, blob);
    } else {
      return await saveIcon(newIcon);
    }
  } catch (error) {
    console.error("Error creating icon:", error);
    throw error;
  }
}

export async function updateIcon(
  id: string,
  updates: Partial<MarkerIcon>,
  iconFile?: File,
): Promise<MarkerIcon | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    const icons = await getAllIcons();
    const existingIcon = icons.find((i) => i.id === id);
    if (!existingIcon) return null;

    const updatedIcon = { ...existingIcon, ...updates };

    if (iconFile) {
      const url = await uploadFile(iconFile);
      updatedIcon.url = url;

      const blob = new Blob([await iconFile.arrayBuffer()], {
        type: iconFile.type,
      });
      return await saveIcon(updatedIcon, blob);
    } else {
      return await saveIcon(updatedIcon);
    }
  } catch (error) {
    console.error("Error updating icon:", error);
    throw error;
  }
}

export async function removeIcon(id: string): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  try {
    return await deleteIcon(id);
  } catch (error) {
    console.error("Error removing icon:", error);
    return false;
  }
}

// Дополнительная функция для сохранения медиафайла с загруженным файлом
export async function createMediaWithFile(
  media: Omit<MediaItem, "id" | "url">,
  file: File,
): Promise<MediaItem> {
  if (!isBrowser) {
    throw new Error("Browser API not available");
  }

  try {
    const url = await uploadFile(file);
    const newMedia: MediaItem = {
      ...media,
      id: Date.now().toString(),
      url,
      type: file.type.startsWith("image/") ? "image" : "video",
    };

    return await saveMedia(newMedia);
  } catch (error) {
    console.error("Error creating media with file:", error);
    throw error;
  }
}

// API для работы с маршрутами
export interface RouteResponse {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

// Получение маршрута
export async function getRoute(
  start: [number, number],
  end: [number, number],
): Promise<RouteResponse> {
  try {
    const coordinates = generateRealisticRoute(start, end);
    const distance = calculateRouteDistance(coordinates);
    const duration = distance / ROUTE_CONFIG.WALKING_SPEED;

    return {
      coordinates,
      distance,
      duration,
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    return getFallbackRoute(start, end);
  }
}

// Генерация реалистичного маршрута с поворотами
function generateRealisticRoute(
  start: [number, number],
  end: [number, number],
): [number, number][] {
  const coordinates: [number, number][] = [];
  coordinates.push(start);

  const numSegments = 8;
  const latDiff = end[0] - start[0];
  const lngDiff = end[1] - start[1];

  for (let i = 1; i < numSegments; i++) {
    const factor = i / numSegments;
    const randomLat = (Math.random() - 0.5) * 0.0002;
    const randomLng = (Math.random() - 0.5) * 0.0002;

    let lngOffset = 0;
    if (factor > 0.3 && factor < 0.4) {
      lngOffset = 0.0001;
    } else if (factor > 0.6 && factor < 0.7) {
      lngOffset = -0.0001;
    }

    const lat = start[0] + latDiff * factor + randomLat;
    const lng = start[1] + lngDiff * factor + randomLng + lngOffset;

    coordinates.push([lat, lng]);
  }

  coordinates.push(end);
  return coordinates;
}

// Расчет расстояния маршрута
function calculateRouteDistance(coordinates: [number, number][]): number {
  let totalDistance = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    totalDistance += calculateDistance(prev, curr);
  }

  return totalDistance;
}

// Расчет расстояния между двумя точками (формула гаверсинусов)
function calculateDistance(
  point1: [number, number],
  point2: [number, number],
): number {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = (point1[0] * Math.PI) / 180;
  const φ2 = (point2[0] * Math.PI) / 180;
  const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180;
  const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Fallback маршрут по прямой с промежуточными точками
function getFallbackRoute(
  start: [number, number],
  end: [number, number],
): RouteResponse {
  const numPoints = 20;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const factor = i / numPoints;
    const lat = start[0] + (end[0] - start[0]) * factor;
    const lng = start[1] + (end[1] - start[1]) * factor;
    coordinates.push([lat, lng]);
  }

  const distance = calculateDistance(start, end);

  return {
    coordinates,
    distance,
    duration: distance / ROUTE_CONFIG.WALKING_SPEED,
  };
}
