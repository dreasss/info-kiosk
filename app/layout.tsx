import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/language-context";
import { IdleScreen } from "@/components/ui/idle-screen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Интерактивная карта ОИЯИ",
  description: "Информационная система для навигации по территории ОИЯИ",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <IdleScreen>
              <div className="min-h-screen">{children}</div>
            </IdleScreen>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
