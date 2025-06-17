"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TouchButton } from "@/components/ui/touch-button";
import { ClockDate } from "@/components/ui/clock-date";
import { RssTicker } from "@/components/ui/rss-ticker";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { NewsCarousel } from "@/components/ui/news-carousel";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import {
  Map,
  ImageIcon,
  Newspaper,
  Info,
  Building2,
  Settings,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { fetchNews, fetchTimerSettings } from "@/lib/api";
import { resetDBState, getDBStatus } from "@/lib/db";
import type { NewsItem } from "@/types/news";

export default function HomePage() {
  const { language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render client-specific content after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to get text with fallback for hydration
  const getText = (en: string, ru: string) => {
    return isClient && language === "en" ? en : ru;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setDbError(null); // Сбрасываем ошибку перед попыткой

        // Загружаем новости
        const newsData = await fetchNews();
        setNews(newsData.slice(0, 5)); // Берем только 5 последних новостей

        // Загружаем настройки таймера
        const timerData = await fetchTimerSettings();
        setTimerSettings(timerData);
      } catch (error) {
        console.error("Error loading data:", error);

        // Устанавливаем сообщение об ошибке
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        if (
          errorMessage.includes("IndexedDB") ||
          errorMessage.includes("база данных")
        ) {
          setDbError(
            "Проблемы с локальным хранилищем. Приложение работает в режиме демо-данных.",
          );
        }
      }
    };

    loadData();
  }, [retryCount]);

  const handleRetryDatabase = () => {
    console.log("Attempting to reset database state...");
    resetDBState(); // Сбрасываем состояние БД
    setRetryCount((prev) => prev + 1); // Перезапускаем useEffect
  };

  // В режиме разработки добавляем функции БД в глобальную область
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      // Добавляем функции в глобальную область для отладки
      (window as any).dbReset = resetDBState;
      (window as any).dbStatus = getDBStatus;
      (window as any).dbForceReset = () => {
        // Полный сброс базы данных
        if (typeof window !== "undefined") {
          const deleteReq = indexedDB.deleteDatabase("interactive_map_db");
          deleteReq.onsuccess = () => {
            console.log("Database deleted successfully");
            window.location.reload();
          };
          deleteReq.onerror = () => {
            console.error("Error deleting database");
          };
        }
      };

      console.log("🔧 Database debugging tools available:");
      console.log("  - window.dbReset() - Сброс состояния базы данных");
      console.log("  - window.dbStatus() - Проверка состояния базы данных");
      console.log(
        "  - window.dbForceReset() - Полное удаление и пересоздание БД",
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-gray-100">
      {/* Шапка с более мягким градиентом */}
      <header className="bg-gradient-to-r from-blue-500/90 via-blue-600/95 to-sky-500/90 shadow-lg relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Логотип и название */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-lg scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/40 shadow-2xl flex items-center justify-center overflow-hidden group-hover:shadow-3xl transition-all duration-300">
                  <Image
                    src="https://cdn.builder.io/api/v1/assets/0968c4d4542442209a8c7e4e9ccf912f/img_2057-2-894a7e?format=webp&width=800"
                    alt="JINR Logo"
                    width={85}
                    height={85}
                    className="object-contain rounded-full scale-90 group-hover:scale-95 transition-transform duration-300"
                  />
                </div>
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold text-white"
                  suppressHydrationWarning={true}
                  style={{
                    textShadow:
                      "1px 1px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.8), 1px -1px 0px rgba(0,0,0,0.8), -1px 1px 0px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.3)",
                  }}
                >
                  {getText(
                    "Joint Institute for Nuclear Research",
                    "Объединенный Институт Ядерных Исследований",
                  )}
                </h1>
              </div>
            </div>

            {/* Часы и дата по центру */}
            <div className="hidden md:flex flex-1 justify-center">
              <div
                className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <ClockDate />
              </div>
            </div>

            {/* Переключатель языка и кнопка админки */}
            <div className="flex items-center gap-3">
              <div
                className="bg-white/15 backdrop-blur-md rounded-xl border border-white/30 shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <LanguageSwitcher />
              </div>

              <Link href="/admin">
                <div
                  className="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/30 shadow-lg hover:shadow-xl hover:bg-white/25 transition-all duration-300 group transform hover:scale-105 hover:-translate-y-0.5"
                  style={{
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Settings className="h-5 w-5 text-white group-hover:rotate-180 transition-transform duration-500" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Индикатор ошибки базы данных */}
      {dbError && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 mx-4 mt-4 rounded-r-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800 text-sm font-medium">{dbError}</p>
            </div>
            <TouchButton
              onClick={handleRetryDatabase}
              variant="outline"
              className="px-3 py-1 text-xs bg-amber-200 hover:bg-amber-300 border-amber-400 text-amber-800"
            >
              Повторить
            </TouchButton>
          </div>
        </div>
      )}

      {/* Бегущая строка новостей */}
      <RssTicker />

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Приветствие */}
          <div
            className="text-center mb-8 animate-fadeInUp"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300"
              suppressHydrationWarning={true}
            >
              {isClient && language === "en" ? "Welcome" : "Добро пожаловать"}
            </h2>
            <p
              className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              suppressHydrationWarning={true}
            >
              {isClient && language === "en"
                ? "JINR Interactive Information System"
                : "Интерактивная информационная система ОИЯИ"}
            </p>
          </div>

          {/* Сетка навигации */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <TouchButton
              href="/map"
              icon={Map}
              title={isClient && language === "en" ? "Map" : "Карта"}
              className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600 hover:to-blue-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-blue-400/50 hover:border-blue-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(59, 130, 246, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />

            <TouchButton
              href="/gallery"
              icon={ImageIcon}
              title={isClient && language === "en" ? "Gallery" : "Галерея"}
              className="bg-gradient-to-br from-purple-500/90 to-purple-600/90 hover:from-purple-600 hover:to-purple-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0.1s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(147, 51, 234, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />

            <TouchButton
              href="/news"
              icon={Newspaper}
              title={isClient && language === "en" ? "News" : "Новости"}
              className="bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600 hover:to-green-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-green-400/50 hover:border-green-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0.2s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(34, 197, 94, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />

            <TouchButton
              href="/infrastructure"
              icon={Building2}
              title={
                isClient && language === "en"
                  ? "Infrastructure"
                  : "Инфраструктура"
              }
              className="bg-gradient-to-br from-orange-500/90 to-orange-600/90 hover:from-orange-600 hover:to-orange-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-orange-400/50 hover:border-orange-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0.3s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(249, 115, 22, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />

            <TouchButton
              href="/events"
              icon={Calendar}
              title={isClient && language === "en" ? "Events" : "События"}
              className="bg-gradient-to-br from-rose-500/90 to-rose-600/90 hover:from-rose-600 hover:to-rose-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-rose-400/50 hover:border-rose-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0.4s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(244, 63, 94, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />

            <TouchButton
              href="/about"
              icon={Info}
              title={isClient && language === "en" ? "About" : "О ОИЯИ"}
              className="bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 hover:from-indigo-600 hover:to-indigo-700 text-white h-32 md:h-36 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 border-indigo-400/50 hover:border-indigo-300/70 group animate-fadeInUp transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              touchSize="lg"
              style={{
                animationDelay: "0.5s",
                animationFillMode: "both",
                boxShadow:
                  "0 20px 40px rgba(99, 102, 241, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>

          {/* Таймер обратного отсчета */}
          {isClient && timerSettings?.enabled && timerSettings?.timer && (
            <div
              className="mb-8 animate-fadeInUp"
              style={{ animationDelay: "0.6s", animationFillMode: "both" }}
            >
              <CountdownTimer timer={timerSettings.timer} />
            </div>
          )}

          {/* Карусель новостей */}
          <div
            className="flex-1 mb-6 animate-fadeInUp"
            style={{ animationDelay: "0.6s" }}
          >
            <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden h-full hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01] card-hover">
              <div className="p-6">
                <h3
                  className="text-2xl font-bold text-gray-800 mb-6 flex items-center"
                  suppressHydrationWarning={true}
                >
                  <Newspaper className="h-6 w-6 mr-3 text-green-600" />
                  {isClient && language === "en"
                    ? "Latest News"
                    : "Последние новости"}
                </h3>
                <NewsCarousel news={news} />
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Футер с контактной информацией */}
      <footer className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-4 px-4 border-t border-white/10">
        <div
          className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-sm animate-fadeInUp"
          style={{ animationDelay: "0.8s", animationFillMode: "both" }}
        >
          <div className="flex items-center hover:scale-105 transition-transform duration-300">
            <span className="font-medium mr-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              © 2025 ОИЯИ
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center hover:scale-105 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer">
              <span className="opacity-70 mr-2 text-lg">📍</span>
              <span>
                {isClient && language === "en"
                  ? "Dubna, Moscow Region"
                  : "г. Дубна, Московская область"}
              </span>
            </div>
            <div className="flex items-center hover:scale-105 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer">
              <span className="opacity-70 mr-2 text-lg">📞</span>
              <span>+7 (496) 216-50-59</span>
            </div>
            <div className="flex items-center hover:scale-105 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer">
              <span className="opacity-70 mr-2 text-lg">✉️</span>
              <span>post@jinr.ru</span>
            </div>
            <div className="flex items-center hover:scale-105 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer">
              <span className="opacity-70 mr-2 text-lg">🌐</span>
              <span>www.jinr.ru</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
