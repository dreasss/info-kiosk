"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg">
      <Button
        variant={language === "ru" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ru")}
        className={`flex items-center gap-2 transition-all duration-300 rounded-lg ${
          language === "ru"
            ? "bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "text-white hover:bg-white/20 hover:text-white hover:scale-105"
        }`}
        style={
          language !== "ru"
            ? {
                textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
              }
            : {}
        }
      >
        <span className="text-lg hover:scale-110 transition-transform duration-200">
          🇷🇺
        </span>
        <span className="font-medium">RU</span>
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-2 transition-all duration-300 rounded-lg ${
          language === "en"
            ? "bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105"
            : "text-white hover:bg-white/20 hover:text-white hover:scale-105"
        }`}
        style={
          language !== "en"
            ? {
                textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
              }
            : {}
        }
      >
        <span className="text-lg hover:scale-110 transition-transform duration-200">
          🇺🇸
        </span>
        <span className="font-medium">EN</span>
      </Button>
    </div>
  );
}
