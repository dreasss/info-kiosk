"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchActiveRssFeeds, type RssFeed } from "@/lib/api";

interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
}

interface RssTickerProps {
  className?: string;
}

export function RssTicker({ className }: RssTickerProps) {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render content after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // RSS лента с elementy.ru
  const elementyRssFeed: RssFeed = {
    id: "elementy-russia",
    name: "Элементы.ру",
    url: "https://elementy.ru/rss/news/russia",
    active: true,
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchRssNews = async () => {
      try {
        setLoading(true);

        // Получаем активные RSS ленты из базы данных и добавляем elementy.ru
        console.log("RSS Ticker: Fetching RSS feeds...");
        let activeFeeds = await fetchActiveRssFeeds();

        // Всегда добавляем elementy.ru как основную ленту
        const feedsToLoad = [elementyRssFeed, ...activeFeeds];
        console.log(
          "RSS Ticker: Loading feeds:",
          feedsToLoad.map((f) => f.name),
        );

        // Загружаем RSS данные
        const allNewsItems: RssItem[] = [];

        for (const feed of feedsToLoad) {
          try {
            // Используем CORS прокси для загрузки RSS
            const response = await fetch(
              `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`,
            );
            const data = await response.json();

            if (data.contents) {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(data.contents, "text/xml");

              // Парсим RSS элементы
              const items = xmlDoc.querySelectorAll("item");

              items.forEach((item, index) => {
                if (index < 5) {
                  // Берем только первые 5 новостей с каждой ленты
                  const title = item.querySelector("title")?.textContent || "";
                  const link = item.querySelector("link")?.textContent || "#";
                  const pubDate =
                    item.querySelector("pubDate")?.textContent ||
                    new Date().toISOString();

                  if (title) {
                    allNewsItems.push({
                      title,
                      link,
                      pubDate,
                      source: feed.name,
                    });
                  }
                }
              });
            }
          } catch (feedError) {
            console.warn(
              `RSS Ticker: Error loading RSS feed ${feed.name}:`,
              feedError,
            );
            continue;
          }
        }

        // Если удалось загрузить новости, используем их
        if (allNewsItems.length > 0) {
          // Сортируем по дате и берем последние 10
          allNewsItems.sort(
            (a, b) =>
              new Date(b.pubDate || 0).getTime() -
              new Date(a.pubDate || 0).getTime(),
          );
          console.log(
            "RSS Ticker: Successfully loaded",
            allNewsItems.length,
            "news items",
          );
          setNews(allNewsItems.slice(0, 10));
        } else {
          // Если RSS не загрузился, показываем сообщение об ошибке
          console.log("RSS Ticker: No RSS items loaded");
          setNews([
            {
              title:
                "Не удалось загрузить новости. Проверьте подключение к интернету.",
              link: "#",
              pubDate: new Date().toISOString(),
              source: "Система",
            },
          ]);
        }
      } catch (error) {
        console.error("RSS Ticker: Error fetching RSS feeds:", error);

        // В случае ошибки показываем сообщение об ошибке
        setNews([
          {
            title:
              "Ошибка загрузки RSS лент. Проверьте подключение к интернету.",
            link: "#",
            pubDate: new Date().toISOString(),
            source: "Система",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRssNews();

    // Обновляем новости каждые 15 минут
    const interval = setInterval(fetchRssNews, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Show nothing while not client-ready
  if (!isClient) {
    return null;
  }

  // Show loading or fallback
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500/90 via-blue-600/95 to-sky-500/90 backdrop-blur-sm text-white py-4 overflow-hidden border-y border-white/10">
        <div className="flex items-center h-8">
          <div className="font-bold mr-8 px-6 py-2 whitespace-nowrap bg-white/15 backdrop-blur-md rounded-r-2xl flex items-center shadow-lg border border-white/20">
            <span className="text-yellow-300 mr-2 text-lg">📡</span>
            <span className="font-semibold tracking-wide">
              ЗАГРУЗКА НОВОСТЕЙ...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If no news found, don't show anything
  if (news.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-blue-500/90 via-blue-600/95 to-sky-500/90 backdrop-blur-sm text-white py-4 overflow-hidden border-y border-white/10",
        className,
      )}
    >
      <div className="flex items-center h-8">
        <div
          className="font-bold mr-8 px-6 py-2 whitespace-nowrap bg-white/15 backdrop-blur-md rounded-r-2xl flex items-center shadow-lg border border-white/20"
          style={{
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <span className="text-yellow-300 mr-2 text-lg">📡</span>
          <span className="font-semibold tracking-wide">НОВОСТИ НАУКИ</span>
        </div>
        <div className="ticker-container overflow-hidden relative w-full">
          <div className="ticker-content whitespace-nowrap animate-scroll-slow">
            {news.concat(news).map((item, index) => (
              <span
                key={index}
                className="mx-12 font-medium hover:text-blue-200 cursor-pointer transition-all duration-300 hover:scale-105 inline-block"
              >
                <span className="text-yellow-300 mr-3 text-lg">🔬</span>
                <span className="font-semibold text-blue-100">
                  {item.source}
                </span>
                <span className="mx-2 text-white/70">•</span>
                <span className="text-white">{item.title}</span>
                <span className="mx-8 text-blue-300/60">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Экспортируем также под старым именем для совместимости
export { RssTicker as RSSTicker };
