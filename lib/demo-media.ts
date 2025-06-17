import { createMediaItem, createAlbum, createRssFeed } from "@/lib/api";
import type { MediaItem, Album } from "@/types/media";
import type { RssFeed } from "@/lib/db";

// Функция для создания демо альбомов и медиафайлов
export async function createDemoRssFeeds(): Promise<void> {
  try {
    console.log("Creating demo RSS feeds...");

    const demoFeeds: Omit<RssFeed, "id">[] = [
      {
        name: "ОИЯИ Новости",
        url: "https://www.jinr.ru/news/rss/",
        active: true,
      },
      {
        name: "N+1 Наука",
        url: "https://nplus1.ru/rss",
        active: true,
      },
      {
        name: "РИА Новости - Наука",
        url: "https://ria.ru/export/rss2/archive/index.xml?theme=398",
        active: true,
      },
    ];

    for (const feedData of demoFeeds) {
      const feed: RssFeed = {
        ...feedData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      await saveRssFeed(feed);
      console.log(`Created demo RSS feed: ${feed.name}`);
    }

    console.log("Demo RSS feeds created successfully!");
  } catch (error) {
    console.error("Error creating demo RSS feeds:", error);
  }
}

export async function createDemoMediaData(): Promise<void> {
  try {
    // Создаем демо альбомы
    const photoAlbum = await createAlbum({
      name: "Фотографии ОИЯИ",
      description: "Коллекция фотографий научного института",
      type: "photo",
      itemCount: 0,
    });

    const videoAlbum = await createAlbum({
      name: "Видеоматериалы",
      description: "Видео презентации и документальные материалы",
      type: "video",
      itemCount: 0,
    });

    const mixedAlbum = await createAlbum({
      name: "События и мероприятия",
      description: "Фото и видео с различных мероприятий института",
      type: "mixed",
      itemCount: 0,
    });

    // Создаем демо медиафайлы
    const demoMediaItems: Omit<MediaItem, "id" | "date">[] = [
      {
        title: "Главное здание ОИЯИ",
        description: "Архитектурный вид главного корпуса института",
        type: "image",
        category: "photo",
        url: "/placeholder.svg?height=600&width=800&text=Главное+здание+ОИЯИ",
        thumbnail:
          "/placeholder.svg?height=300&width=400&text=Главное+здание+ОИЯИ",
        albumId: photoAlbum.id,
        fileSize: 1024 * 512, // 512KB
        dimensions: { width: 800, height: 600 },
        tags: ["здание", "архитектура", "институт"],
      },
      {
        title: "Лаборатория ядерных исследований",
        description: "Современное оборудование для ядерных исследований",
        type: "image",
        category: "photo",
        url: "/placeholder.svg?height=600&width=800&text=Лаборатория",
        thumbnail: "/placeholder.svg?height=300&width=400&text=Лаборатория",
        albumId: photoAlbum.id,
        fileSize: 1024 * 724, // 724KB
        dimensions: { width: 800, height: 600 },
        tags: ["лаборатория", "оборудование", "наука"],
      },
      {
        title: "Научная конференция 2024",
        description: "Международная конференция по ядерной физике",
        type: "image",
        category: "photo",
        url: "/placeholder.svg?height=600&width=800&text=Конференция+2024",
        thumbnail:
          "/placeholder.svg?height=300&width=400&text=Конференция+2024",
        albumId: mixedAlbum.id,
        fileSize: 1024 * 890, // 890KB
        dimensions: { width: 800, height: 600 },
        tags: ["конференция", "ученые", "2024"],
      },
      {
        title: "Введение в ядерную физику",
        description: "Обучающее видео о принципах ядерной физики",
        type: "video",
        category: "video",
        url: "/placeholder.svg?height=400&width=600&text=Видео+урок",
        thumbnail: "/placeholder.svg?height=200&width=300&text=Видео+урок",
        albumId: videoAlbum.id,
        fileSize: 1024 * 1024 * 45, // 45MB
        duration: 1800, // 30 минут
        tags: ["обучение", "физика", "урок"],
      },
      {
        title: "Экскурсия по институту",
        description: "Виртуальная экскурсия по основным подразделениям ОИЯИ",
        type: "video",
        category: "video",
        url: "/placeholder.svg?height=400&width=600&text=Экскурсия",
        thumbnail: "/placeholder.svg?height=200&width=300&text=Экскурсия",
        albumId: videoAlbum.id,
        fileSize: 1024 * 1024 * 120, // 120MB
        duration: 2400, // 40 минут
        tags: ["экскурсия", "институт", "обзор"],
      },
      {
        title: "Ускорител�� частиц",
        description: "Детальный обзор ускорительного комплекса",
        type: "image",
        category: "photo",
        url: "/placeholder.svg?height=600&width=800&text=Ускоритель",
        thumbnail: "/placeholder.svg?height=300&width=400&text=Ускоритель",
        albumId: photoAlbum.id,
        fileSize: 1024 * 1200, // 1.2MB
        dimensions: { width: 800, height: 600 },
        tags: ["ускоритель", "физика", "оборудование"],
      },
      {
        title: "День открытых дверей",
        description: "Мероприятие для привлечения молодых ученых",
        type: "video",
        category: "video",
        url: "/placeholder.svg?height=400&width=600&text=День+открытых+дверей",
        thumbnail:
          "/placeholder.svg?height=200&width=300&text=День+открытых+дверей",
        albumId: mixedAlbum.id,
        fileSize: 1024 * 1024 * 25, // 25MB
        duration: 900, // 15 минут
        tags: ["мероприятие", "студенты", "открытые двери"],
      },
      {
        title: "Исторический архив",
        description: "Редкие фотографии и�� истории института",
        type: "image",
        category: "photo",
        url: "/placeholder.svg?height=600&width=800&text=Исторический+архив",
        thumbnail:
          "/placeholder.svg?height=300&width=400&text=Исторический+архив",
        // Не указываем albumId, чтобы показать файлы без альбома
        fileSize: 1024 * 350, // 350KB
        dimensions: { width: 800, height: 600 },
        tags: ["история", "архив", "ретро"],
      },
    ];

    // Создаем медиафайлы
    for (const mediaItem of demoMediaItems) {
      await createMediaItem(mediaItem);
    }

    console.log("Демо медиафайлы созданы успешно!");
  } catch (error) {
    console.error("Ошибка создания демо медиафайлов:", error);
  }
}

// Функция для очистки всех медиафайлов (для тестирования)
export async function clearAllMedia(): Promise<void> {
  // Эта функция будет реализована при необходимости
  console.log("Функция очистки медиафайлов не реализована");
}
