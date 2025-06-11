"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TouchButton } from "@/components/ui/touch-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { getJinrEvents, type JinrEvent } from "@/lib/events-parser"
import { Calendar, Clock, MapPin, Home, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
  const [events, setEvents] = useState<JinrEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { language } = useLanguage()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await getJinrEvents()
      setEvents(data)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: "all", name: language === "ru" ? "Все события" : "All Events" },
    { id: "conference", name: language === "ru" ? "Конференции" : "Conferences" },
    { id: "seminar", name: language === "ru" ? "Семинары" : "Seminars" },
    { id: "lecture", name: language === "ru" ? "Лекции" : "Lectures" },
    { id: "defense", name: language === "ru" ? "Защиты" : "Defenses" },
    { id: "meeting", name: language === "ru" ? "Совещания" : "Meetings" },
    { id: "other", name: language === "ru" ? "Прочее" : "Other" },
  ]

  const filteredEvents = events.filter((event) => selectedCategory === "all" || event.category === selectedCategory)

  const eventsForSelectedDate = selectedDate ? filteredEvents.filter((event) => event.date === selectedDate) : []

  const getEventsForDate = (date: string) => {
    return filteredEvents.filter((event) => event.date === date)
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split("T")[0]
      const dayEvents = getEventsForDate(dateStr)
      const isCurrentMonth = current.getMonth() === month
      const isToday = dateStr === new Date().toISOString().split("T")[0]
      const isSelected = dateStr === selectedDate

      days.push(
        <button
          key={dateStr}
          onClick={() => setSelectedDate(dateStr)}
          className={`
            relative p-2 h-16 text-sm border border-gray-200 transition-all duration-200
            ${isCurrentMonth ? "bg-white hover:bg-blue-50" : "bg-gray-50 text-gray-400"}
            ${isToday ? "bg-blue-100 border-blue-300" : ""}
            ${isSelected ? "bg-blue-500 text-white" : ""}
            ${dayEvents.length > 0 ? "font-semibold" : ""}
          `}
        >
          <div className="flex flex-col h-full">
            <span className={isSelected ? "text-white" : ""}>{current.getDate()}</span>
            {dayEvents.length > 0 && (
              <div className="flex-1 flex items-end justify-center">
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"}`}></div>
              </div>
            )}
          </div>
        </button>,
      )

      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const monthNames =
    language === "ru"
      ? [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]

  const weekDays =
    language === "ru" ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{language === "ru" ? "Загрузка событий..." : "Loading events..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Шапка */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <TouchButton asChild className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20">
                <Link href="/">
                  <Home className="h-5 w-5 mr-2" />
                  {language === "ru" ? "Главная" : "Home"}
                </Link>
              </TouchButton>
              <h1 className="text-3xl font-bold text-white">{language === "ru" ? "События ОИЯИ" : "JINR Events"}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Календарь */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {language === "ru" ? "Календарь событий" : "Events Calendar"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-semibold min-w-[200px] text-center">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Фильтры и список событий */}
          <div className="space-y-6">
            {/* Фильтры */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {language === "ru" ? "Фильтры" : "Filters"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedCategory === category.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* События выбранной даты */}
            {selectedDate && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>
                    {language === "ru" ? "События на " : "Events for "}
                    {new Date(selectedDate).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {eventsForSelectedDate.map((event) => (
                        <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                          {event.description && <p className="text-sm text-gray-600 mt-2">{event.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {language === "ru" ? "На эту дату событий нет" : "No events for this date"}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Список всех событий */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {language === "ru" ? "Все события" : "All Events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-800">{event.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-3">{event.description}</p>
                      )}
                      {event.url && (
                        <TouchButton asChild className="mt-4 w-full">
                          <a href={event.url} target="_blank" rel="noopener noreferrer">
                            {language === "ru" ? "Подробнее" : "Learn More"}
                          </a>
                        </TouchButton>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {language === "ru" ? "События не найдены" : "No events found"}
                </h3>
                <p className="text-gray-500">
                  {language === "ru"
                    ? "В настоящее время события отсутствуют или не удалось их загрузить"
                    : "No events available at the moment or failed to load them"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
