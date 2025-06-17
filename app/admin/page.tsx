"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Settings,
  MapPin,
  Newspaper,
  ImageIcon,
  Rss,
  Building,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { TouchButton } from "@/components/ui/touch-button";
import { MediaManager } from "@/components/admin/media-manager";
import { POIManager } from "@/components/admin/poi-manager";
import { NewsManager } from "@/components/admin/news-manager";
import { RssManager } from "@/components/admin/rss-manager";
import { IconManager } from "@/components/admin/icon-manager";
import { SettingsManager } from "@/components/admin/settings-manager";
import { TimerManager } from "@/components/admin/timer-manager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("media");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    console.log("Loading data...");
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Загрузка панели администратора...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <TouchButton asChild variant="outline">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  На главную
                </Link>
              </TouchButton>
              <h1 className="text-2xl font-bold text-gray-900">
                Панель администратора
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="pois">
              <MapPin className="h-4 w-4 mr-2" />
              Объекты
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4 mr-2" />
              Новости
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="h-4 w-4 mr-2" />
              Медиа
            </TabsTrigger>
            <TabsTrigger value="rss">
              <Rss className="h-4 w-4 mr-2" />
              RSS
            </TabsTrigger>
            <TabsTrigger value="timer">
              <Clock className="h-4 w-4 mr-2" />
              Таймер
            </TabsTrigger>
            <TabsTrigger value="icons">
              <Building className="h-4 w-4 mr-2" />
              Иконки
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* POIs Tab */}
          <TabsContent value="pois" className="space-y-6">
            <POIManager onDataChange={loadData} />
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <NewsManager onDataChange={loadData} />
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <MediaManager onDataChange={loadData} />
          </TabsContent>

          {/* RSS Tab */}
          <TabsContent value="rss" className="space-y-6">
            <RssManager onDataChange={loadData} />
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <TimerManager onDataChange={loadData} />
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-6">
            <IconManager onDataChange={loadData} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsManager onDataChange={loadData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
