"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Star } from "lucide-react";
import type { EventTimer } from "@/types/timer";

interface CountdownTimerProps {
  timer: EventTimer;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ timer }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(timer.eventDate).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [timer.eventDate]);

  const formatEventDate = () => {
    const date = new Date(timer.eventDate);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isExpired) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl animate-fadeInUp">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {timer.image && (
              <div className="relative">
                <img
                  src={timer.image}
                  alt={timer.title}
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}
            <div className={timer.image ? "" : "md:col-span-2"}>
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 mr-2 text-yellow-300" />
                <h3 className="text-2xl font-bold">Событие состоялось!</h3>
              </div>
              <h4 className="text-3xl font-bold mb-4">{timer.title}</h4>
              <p className="text-lg opacity-90 mb-4">{timer.description}</p>
              <div className="flex items-center text-yellow-200">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Прошло: {formatEventDate()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl animate-fadeInUp transform hover:scale-[1.02] transition-all duration-300">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300"></div>

      <CardContent className="relative p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Изображение события */}
          {timer.image && (
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 rounded-xl blur-lg scale-110 group-hover:scale-125 transition-transform duration-300"></div>
              <img
                src={timer.image}
                alt={timer.title}
                className="relative w-full h-48 object-cover rounded-xl shadow-2xl border-2 border-white/20 group-hover:shadow-3xl transition-all duration-300"
              />
            </div>
          )}

          {/* Контент */}
          <div className={timer.image ? "" : "md:col-span-2"}>
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 mr-2 text-blue-300 animate-pulse" />
              <h3 className="text-2xl font-bold">До события осталось</h3>
            </div>

            <h4 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {timer.title}
            </h4>

            <p className="text-lg opacity-90 mb-6">{timer.description}</p>

            {/* Таймер */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                  {timeLeft.days}
                </div>
                <div className="text-sm uppercase tracking-wider opacity-80">
                  Дней
                </div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-green-300">
                  {timeLeft.hours}
                </div>
                <div className="text-sm uppercase tracking-wider opacity-80">
                  Часов
                </div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-pink-300">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm uppercase tracking-wider opacity-80">
                  Минут
                </div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-red-300 animate-pulse">
                  {timeLeft.seconds}
                </div>
                <div className="text-sm uppercase tracking-wider opacity-80">
                  Секунд
                </div>
              </div>
            </div>

            {/* Дата события */}
            <div className="flex items-center text-blue-200 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">{formatEventDate()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
