"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "./i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.ru;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");
  const [isClient, setIsClient] = useState(false);

  // Отмечаем, что компонент загружен на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Загружаем сохраненный язык из localStorage
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === "ru" || savedLanguage === "en")) {
        setLanguage(savedLanguage);
      }
    }
  }, [isClient]);

  // Сохраняем язык в localStorage при изменении
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const value = {
    language: isClient ? language : "ru", // Всегда используем "ru" до загрузки клиента
    setLanguage,
    t: translations[isClient ? language : "ru"],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
