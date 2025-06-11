"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
      <Button
        variant={language === "ru" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ru")}
        className={`flex items-center gap-2 ${
          language === "ru"
            ? "bg-white text-blue-600 hover:bg-white/90"
            : "text-white hover:bg-white/20 hover:text-white"
        }`}
      >
        <span className="text-lg">🇷🇺</span>
        <span className="font-medium">RU</span>
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-2 ${
          language === "en"
            ? "bg-white text-blue-600 hover:bg-white/90"
            : "text-white hover:bg-white/20 hover:text-white"
        }`}
      >
        <span className="text-lg">🇺🇸</span>
        <span className="font-medium">EN</span>
      </Button>
    </div>
  )
}
