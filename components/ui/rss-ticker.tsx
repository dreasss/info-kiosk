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

  // Fallback новости если RSS не загружается
  const getFallbackNews = (): RssItem[] => [
    {
      title: "Добро пожаловать в информационную систему ОИЯИ",
      link: "https://www.jinr.ru",
      pubDate: new Date().toISOString(),
      source: "ОИЯИ",
    },
    {
      title: "Последние научные открытия и исследования института",
      link: "https://www.jinr.ru/news/",
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      source: "ОИЯИ",
    },
  ];

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

        // Фильтруем только рабочие домены
        const workingDomains = [
          "elementy.ru",
          "ria.ru",
          "jinr.ru",
          "nplus1.ru",
          "tass.ru",
        ];
        const filteredFeeds = activeFeeds.filter((feed) => {
          try {
            const url = new URL(feed.url);
            return workingDomains.some((domain) =>
              url.hostname.includes(domain),
            );
          } catch {
            return false;
          }
        });

        // Всегда добавляем elementy.ru как основную ленту
        const feedsToLoad = [elementyRssFeed, ...filteredFeeds];
        console.log(
          "RSS Ticker: Loading feeds:",
          feedsToLoad.map((f) => `${f.name} (${f.url})`),
        );
        console.log(
          "RSS Ticker: Filtered out problematic feeds, using",
          feedsToLoad.length,
          "feeds",
        );

        // Загружаем RSS данные
        const allNewsItems: RssItem[] = [];

        for (const feed of feedsToLoad) {
          try {
            console.log(`RSS Ticker: Loading ${feed.name} from ${feed.url}`);

            // Используем наш собственный API для проксирования RSS
            const response = await fetch(
              `/api/rss?url=${encodeURIComponent(feed.url)}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/xml, text/xml, */*",
                },
                // Таймаут 10 секунд для быстрой отработки
                signal: AbortSignal.timeout(10000),
              },
            );

            if (!response.ok) {
              // Получаем детали ошибки
              const errorDetails = await response
                .text()
                .catch(() => "Unknown error");
              console.error(
                `RSS Ticker: API error for ${feed.name}:`,
                errorDetails,
              );
              throw new Error(
                `API returned ${response.status}: ${response.statusText}`,
              );
            }

            const xmlContent = await response.text();
            console.log(
              `RSS Ticker: Received ${xmlContent.length} bytes from ${feed.name}`,
            );

            if (xmlContent) {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

              // Проверяем на ошибки парсинга
              const parseError = xmlDoc.querySelector("parsererror");
              if (parseError) {
                throw new Error(`XML parsing error: ${parseError.textContent}`);
              }

              // Парсим RSS элементы
              const items = xmlDoc.querySelectorAll("item");
              console.log(
                `RSS Ticker: Found ${items.length} items in ${feed.name}`,
              );

              items.forEach((item, index) => {
                if (index < 10) {
                  // Берем первые 10 новостей с каждой ленты
                  const title =
                    item.querySelector("title")?.textContent?.trim() || "";
                  const link =
                    item.querySelector("link")?.textContent?.trim() || "#";
                  const pubDate =
                    item.querySelector("pubDate")?.textContent?.trim() ||
                    item.querySelector("dc\\:date")?.textContent?.trim() ||
                    new Date().toISOString();

                  if (title) {
                    allNewsItems.push({
                      title: title.replace(/\[.*?\]/g, "").trim(), // Убираем [категории] из заголовков
                      link,
                      pubDate,
                      source: feed.name,
                    });
                    console.log(
                      `RSS Ticker: Added item: ${title.substring(0, 50)}...`,
                    );
                  }
                }
              });
            } else {
              console.warn(
                `RSS Ticker: No XML content received for ${feed.name}`,
              );
            }
          } catch (feedError) {
            console.error(
              `RSS Ticker: Error loading RSS feed ${feed.name}:`,
              feedError,
            );
            console.error(`RSS Ticker: Feed URL was: ${feed.url}`);

            // Если ошибка связана с нашим API, логируем подробности
            if (feedError instanceof Error) {
              if (feedError.message.includes("API returned")) {
                console.error(`RSS Ticker: Server-side error for ${feed.name}`);
              } else if (feedError.message.includes("timeout")) {
                console.error(`RSS Ticker: Timeout loading ${feed.name}`);
              }
            }
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
          // Если RSS не загрузился, показываем fallback новости
          console.log("RSS Ticker: No RSS items loaded, using fallback news");
          setNews(getFallbackNews());
        }
      } catch (error) {
        console.error("RSS Ticker: Error fetching RSS feeds:", error);

        // В случае ошибки показываем fallback новости
        console.log("RSS Ticker: Using fallback news due to error");
        setNews(getFallbackNews());
      } finally {
        setLoading(false);
      }
    };

    fetchRssNews();

    // Обновляем новости каждые 15 минут
    const interval = setInterval(fetchRssNews, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Добавляем функцию тестирования RSS в глобальную область для отладки
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      (window as any).testRSS = async () => {
        console.log("Testing RSS loading...");
        try {
          const testFeeds = await fetchActiveRssFeeds();
          console.log("Active feeds from DB:", testFeeds);

          const testUrl = "https://elementy.ru/rss/news/russia";
          console.log("Testing internal API access to:", testUrl);

          try {
            const response = await fetch(
              `/api/rss?url=${encodeURIComponent(testUrl)}`,
            );
            if (response.ok) {
              const xmlContent = await response.text();
              console.log("API response length:", xmlContent.length);
              console.log("XML preview:", xmlContent.substring(0, 200) + "...");

              const parser = new DOMParser();
              const doc = parser.parseFromString(xmlContent, "text/xml");
              const items = doc.querySelectorAll("item");
              console.log("Found RSS items:", items.length);
            } else {
              console.error(
                "API response error:",
                response.status,
                response.statusText,
              );
            }
          } catch (error) {
            console.error("Internal API failed:", error);
          }
        } catch (error) {
          console.error("RSS test failed:", error);
        }
      };
      console.log("🔧 RSS debugging tool available: window.testRSS()");
    }
  }, []);

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
