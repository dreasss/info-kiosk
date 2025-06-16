"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { fetchSettings } from "@/lib/api";
import type { SystemSettings } from "@/types/settings";

interface IdleScreenProps {
  children: React.ReactNode;
}

export function IdleScreen({ children }: IdleScreenProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Загружаем настройки при монтировании
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const systemSettings = await fetchSettings();
        setSettings(systemSettings);
      } catch (error) {
        console.error("Error loading settings for idle screen:", error);
      }
    };

    loadSettings();
  }, []);

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      setIsIdle(false);

      // Не запускаем таймер на странице администратора
      if (pathname.startsWith("/admin")) {
        return;
      }

      timeoutId = setTimeout(
        () => {
          setIsIdle(true);
        },
        settings?.idleTimeout || 5 * 60 * 1000,
      ); // Используем настройки из базы данных или 5 минут по умолчанию
    };

    const handleActivity = () => {
      resetTimer();
    };

    // События для отслеживания активности
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [pathname, settings]);

  const handleReturnHome = () => {
    setIsIdle(false);
    router.push("/");
  };

  if (isIdle) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 z-50 flex items-center justify-center overflow-hidden">
        {/* Анимированный фон */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-200 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-white rounded-full animate-pulse"></div>
        </div>

        <div className="text-center text-white z-10 max-w-4xl mx-auto px-8">
          {/* Логотип */}
          <div className="mb-8">
            <Image
              src="/images/jinr-logo.png"
              alt="JINR Logo"
              width={200}
              height={200}
              className="mx-auto drop-shadow-2xl animate-pulse"
            />
          </div>

          {/* Название */}
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Объединенный Институт
          </h1>
          <h2 className="text-4xl font-bold mb-8 text-blue-200 drop-shadow-lg">
            Ядерных Исследований
          </h2>

          {/* Время и дата */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-200" />
                <span className="text-4xl font-mono font-bold">
                  {currentTime.toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Calendar className="h-6 w-6 text-blue-200" />
              <span className="text-xl">
                {currentTime.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Информация */}
          <div className="mb-8">
            <p className="text-xl mb-4 opacity-90">
              Добро пожаловать в информационную систему
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-200">
              <MapPin className="h-5 w-5" />
              <span>г. Дубна, Московская область</span>
            </div>
          </div>

          {/* Кнопка */}
          <div className="space-y-4">
            <p className="text-lg opacity-80">
              Коснитесь экрана для продолжения
            </p>
            <Button
              onClick={handleReturnHome}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-6 rounded-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Начать работу
            </Button>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
