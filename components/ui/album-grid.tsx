"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Image as ImageIcon, Video, Play, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Album, MediaItem } from "@/types/media";

interface AlbumGridProps {
  albums: Album[];
  mediaItems: MediaItem[];
  onAlbumSelect?: (albumId: string) => void;
}

export function AlbumGrid({
  albums,
  mediaItems,
  onAlbumSelect,
}: AlbumGridProps) {
  const getCoverImage = (album: Album): MediaItem | null => {
    if (album.coverImageId) {
      return mediaItems.find((item) => item.id === album.coverImageId) || null;
    }

    // Если обложка не установлена, берем первое изображение из альбома
    const albumMedia = mediaItems.filter((item) => item.albumId === album.id);
    return (
      albumMedia.find((item) => item.type === "image") || albumMedia[0] || null
    );
  };

  const getAlbumStats = (album: Album) => {
    const albumMedia = mediaItems.filter((item) => item.albumId === album.id);
    const photoCount = albumMedia.filter(
      (item) => item.category === "photo",
    ).length;
    const videoCount = albumMedia.filter(
      (item) => item.category === "video",
    ).length;

    return { photoCount, videoCount, totalCount: albumMedia.length };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {albums.map((album) => {
        const coverImage = getCoverImage(album);
        const stats = getAlbumStats(album);

        return (
          <Card
            key={album.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            onClick={() => onAlbumSelect?.(album.id)}
          >
            <CardContent className="p-0">
              {/* Обложка альбома */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {coverImage ? (
                  <Image
                    src={coverImage.thumbnail || coverImage.url}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Overlay с информацией */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {stats.photoCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-white/90 text-gray-800"
                          >
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {stats.photoCount}
                          </Badge>
                        )}
                        {stats.videoCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-white/90 text-gray-800"
                          >
                            <Video className="h-3 w-3 mr-1" />
                            {stats.videoCount}
                          </Badge>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Тип альбома */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      album.type === "photo"
                        ? "default"
                        : album.type === "video"
                          ? "secondary"
                          : "outline"
                    }
                    className="bg-white/90 text-gray-800"
                  >
                    {album.type === "photo"
                      ? "Фото"
                      : album.type === "video"
                        ? "Видео"
                        : "Смешанный"}
                  </Badge>
                </div>
              </div>

              {/* Информация об альбоме */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                  {album.name}
                </h3>
                {album.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {album.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {stats.totalCount === 0
                      ? "Пустой альбом"
                      : stats.totalCount === 1
                        ? "1 элемент"
                        : stats.totalCount < 5
                          ? `${stats.totalCount} элемента`
                          : `${stats.totalCount} элементов`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(album.updatedAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {albums.length === 0 && (
        <div className="col-span-full text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Нет альбомов
          </h3>
          <p className="text-gray-500">
            Создайте первый альбом для организации медиафайлов
          </p>
        </div>
      )}
    </div>
  );
}
