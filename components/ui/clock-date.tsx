"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"

export function ClockDate() {
  const [time, setTime] = useState(new Date())
  const { language } = useLanguage()

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    if (language === "ru") {
      const months = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
      ]
      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    } else {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white mb-1">{formatTime(time)}</div>
      <div className="text-sm text-blue-100">{formatDate(time)}</div>
    </div>
  )
}
