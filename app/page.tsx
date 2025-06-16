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
import {
  Map,
  ImageIcon,
  Newspaper,
  Info,
  Building2,
  Settings,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { fetchNews } from "@/lib/api";
import type { NewsItem } from "@/types/news";

export default function HomePage() {
  const { language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNews(data.slice(0, 5)); // Берем только 5 последних новостей
      } catch (error) {
        console.error("Error loading news:", error);
      }
    };

    loadNews();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Шапка с более мягким градиентом */}
      <header className="bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 shadow-lg relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Логотип и название */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-lg scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/40 shadow-2xl flex items-center justify-center overflow-hidden group-hover:shadow-3xl transition-all duration-300">
                  <Image
                    src="/images/jinr-logo.png"
                    alt="JINR Logo"
                    width={70}
                    height={70}
                    className="object-cover rounded-full scale-90 group-hover:scale-95 transition-transform duration-300"
                  />
                </div>
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{
                    textShadow:
                      "1px 1px 2px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {language === "ru" || !language
                    ? "Объединенный Институт Ядерных Исследований"
                    : "Joint Institute for Nuclear Research"}
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
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300">
              {language === "ru" || !language ? "Добро пожаловать" : "Welcome"}
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300">
              {language === "ru" || !language
                ? "Интерактивная информационная система ОИЯИ"
                : "JINR Interactive Information System"}
            </p>
          </div>

          {/* Сетка навигации */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <TouchButton
              href="/map"
              icon={Map}
              title={language === "ru" || !language ? "Карта" : "Map"}
              className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600 hover:to-blue-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-blue-400/30 hover:border-blue-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0s", animationFillMode: "both" }}
            />

            <TouchButton
              href="/gallery"
              icon={ImageIcon}
              title={language === "ru" ? "Галерея" : "Gallery"}
              className="bg-gradient-to-br from-purple-500/90 to-purple-600/90 hover:from-purple-600 hover:to-purple-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            />

            <TouchButton
              href="/news"
              icon={Newspaper}
              title={language === "ru" ? "Новости" : "News"}
              className="bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600 hover:to-green-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-green-400/30 hover:border-green-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            />

            <TouchButton
              href="/infrastructure"
              icon={Building2}
              title={language === "ru" ? "Инфраструктура" : "Infrastructure"}
              className="bg-gradient-to-br from-orange-500/90 to-orange-600/90 hover:from-orange-600 hover:to-orange-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-orange-400/30 hover:border-orange-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            />

            <TouchButton
              href="/events"
              icon={Calendar}
              title={language === "ru" ? "События" : "Events"}
              className="bg-gradient-to-br from-rose-500/90 to-rose-600/90 hover:from-rose-600 hover:to-rose-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-rose-400/30 hover:border-rose-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            />

            <TouchButton
              href="/about"
              icon={Info}
              title={language === "ru" ? "О ОИЯИ" : "About"}
              className="bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 hover:from-indigo-600 hover:to-indigo-700 text-white h-32 md:h-36 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-indigo-400/30 hover:border-indigo-300/50 group animate-fadeInUp"
              touchSize="lg"
              style={{ animationDelay: "0.5s", animationFillMode: "both" }}
            />
          </div>

          {/* Карусель новостей */}
          <div
            className="flex-1 mb-6 animate-fadeInUp"
            style={{ animationDelay: "0.6s" }}
          >
            <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden h-full hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01] card-hover">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <Newspaper className="h-5 w-5 text-blue-600" />
                  </div>
                  {language === "ru" ? "Последние новости" : "Latest News"}
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
                {language === "ru"
                  ? "г. Дубна, Московская область"
                  : "Dubna, Moscow Region"}
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
