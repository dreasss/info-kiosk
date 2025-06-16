"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchActiveRssFeeds } from "@/lib/api";

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

  useEffect(() => {
    const fetchRssNews = async () => {
      try {
        setLoading(true);

        // Моковые данные для RSS-ленты
        const mockNews: RssItem[] = [
          {
            title: "Ученые обнаружили новый тип черны�� дыр в центре галактики",
            link: "#",
            pubDate: new Date().toISOString(),
            source: "Naked Science",
          },
          {
            title:
              "Российские физики создали квантовый компьютер нового поколения",
            link: "#",
            pubDate: new Date(Date.now() - 3600000).toISOString(),
            source: "Naked Science",
          },
          {
            title:
              "Найден способ увеличить эффективность солнечных батарей на 40%",
            link: "#",
            pubDate: new Date(Date.now() - 7200000).toISOString(),
            source: "Naked Science",
          },
          {
            title:
              "Марсоход Perseverance обнаружил следы древней жизни на Марсе",
            link: "#",
            pubDate: new Date(Date.now() - 10800000).toISOString(),
            source: "Naked Science",
          },
          {
            title:
              "Новый метод лечения рака показал эффективность в 95% случаев",
            link: "#",
            pubDate: new Date(Date.now() - 14400000).toISOString(),
            source: "Naked Science",
          },
        ];

        setNews(mockNews);
      } catch (error) {
        console.error("Error fetching RSS feeds:", error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRssNews();

    // Обновляем новости каждые 15 минут
    const interval = setInterval(fetchRssNews, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading || news.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center h-8">
        <div className="font-bold mr-6 px-4 whitespace-nowrap bg-blue-900 rounded-r-full flex items-center">
          <span className="text-yellow-300 mr-2">📡</span>
          НОВОСТИ НАУКИ
        </div>
        <div className="ticker-container overflow-hidden relative w-full">
          <div className="ticker-content whitespace-nowrap animate-scroll">
            {news.concat(news).map((item, index) => (
              <span
                key={index}
                className="mx-8 font-medium hover:text-blue-200 cursor-pointer transition-colors"
              >
                <span className="text-yellow-300 mr-2">🔬</span>
                <span className="font-semibold">{item.source}</span>:{" "}
                {item.title}
                <span className="mx-4 text-blue-300">•</span>
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
