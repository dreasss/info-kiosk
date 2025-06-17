"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchMedia, fetchAlbums, fetchMediaByAlbum } from "@/lib/api";
import type { MediaItem, Album } from "@/types/media";
import {
  Search,
  ImageIcon,
  Video,
  ArrowLeft,
  Play,
  Download,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "photo" | "video">(
    "all",
  );
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const data = await fetchMedia();
        setMedia(data);
        setFilteredMedia(data);
      } catch (error) {
        console.error("Error loading media:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, []);

  useEffect(() => {
    let filtered = media;

    // Фильтр по типу
    if (activeFilter !== "all") {
      filtered = filtered.filter((item) => item.category === activeFilter);
    }

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredMedia(filtered);
  }, [media, activeFilter, searchTerm]);

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = `${item.title}.${item.type === "image" ? "jpg" : "mp4"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Фото и Видео галерея
                </h1>
                <p className="text-sm text-gray-600">
                  Изображения и видеоматериалы ОИЯИ
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              className="flex items-center gap-2"
            >
              Все ({media.length})
            </Button>
            <Button
              variant={activeFilter === "photo" ? "default" : "outline"}
              onClick={() => setActiveFilter("photo")}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Фото ({media.filter((item) => item.category === "photo").length})
            </Button>
            <Button
              variant={activeFilter === "video" ? "default" : "outline"}
              onClick={() => setActiveFilter("video")}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Видео ({media.filter((item) => item.category === "video").length})
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          item.type === "image"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white",
                        )}
                      >
                        {item.type === "image" ? "Фото" : "Видео"}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString("ru-RU")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Медиафайлы не найдены
            </h3>
            <p className="text-gray-600">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        )}
      </main>

      {/* Modal for viewing media */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              {selectedItem.type === "image" ? (
                <div className="relative max-h-[60vh]">
                  <Image
                    src={selectedItem.url || "/placeholder.svg"}
                    alt={selectedItem.title}
                    width={800}
                    height={600}
                    className="max-w-full h-auto"
                  />
                </div>
              ) : (
                <video controls className="max-w-full max-h-[60vh]">
                  <source src={selectedItem.url} type="video/mp4" />
                  Ваш браузер не ��оддерживает воспроизведение видео.
                </video>
              )}
              {selectedItem.description && (
                <p className="text-gray-600 mt-4">{selectedItem.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {new Date(selectedItem.date).toLocaleDateString("ru-RU")}
                </span>
                <Button onClick={() => handleDownload(selectedItem)}>
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
