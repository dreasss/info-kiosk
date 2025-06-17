"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Plus,
  Edit,
  Trash,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Play,
  Download,
  Eye,
  Star,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import type { MediaItem, Album } from "@/types/media";
import {
  fetchMedia,
  fetchAlbums,
  createAlbum,
  updateAlbum,
  removeAlbum,
  uploadMediaFile,
  removeMediaItem,
  updateMediaItem,
} from "@/lib/api";
import { createDemoMediaData } from "@/lib/demo-media";

interface MediaManagerProps {
  onDataChange: () => void;
}

export function MediaManager({ onDataChange }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [albumForm, setAlbumForm] = useState<Partial<Album>>({});
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">(
    "all",
  );
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mediaData, albumsData] = await Promise.all([
        fetchMedia(),
        fetchAlbums(),
      ]);
      setMedia(mediaData);
      setAlbums(albumsData);
    } catch (error) {
      console.error("Error loading media data:", error);
      toast({ title: "Ошибка загрузки данных", variant: "destructive" });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const albumId =
        selectedAlbum !== "all" && selectedAlbum !== "none"
          ? selectedAlbum
          : undefined;
      await uploadMediaFile(file, albumId);
      toast({ title: "Медиафайл загружен" });
      await loadData();
      onDataChange();
      event.target.value = "";
    } catch (error) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
  };

  const handleSaveAlbum = async () => {
    try {
      if (editingAlbum) {
        await updateAlbum({ ...editingAlbum, ...albumForm });
        toast({ title: "Альбом обновлен" });
      } else {
        await createAlbum(
          albumForm as Omit<Album, "id" | "createdAt" | "updatedAt">,
        );
        toast({ title: "Альбом создан" });
      }

      setAlbumForm({});
      setEditingAlbum(null);
      setShowAlbumForm(false);
      await loadData();
      onDataChange();
    } catch (error) {
      toast({ title: "Ошибка сохранения альбома", variant: "destructive" });
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    try {
      await removeAlbum(id);
      toast({ title: "Альбом удален" });
      if (selectedAlbum === id) {
        setSelectedAlbum("all");
      }
      await loadData();
      onDataChange();
    } catch (error) {
      toast({ title: "Ошибка удаления альбома", variant: "destructive" });
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setAlbumForm(album);
    setShowAlbumForm(true);
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await removeMediaItem(id);
      toast({ title: "Медиафайл удален" });
      await loadData();
      onDataChange();
    } catch (error) {
      toast({ title: "Ошибка удаления медиафайла", variant: "destructive" });
    }
  };

  const handleSetAlbumCover = async (albumId: string, mediaId: string) => {
    try {
      const album = albums.find((a) => a.id === albumId);
      if (album) {
        await updateAlbum({ ...album, coverImageId: mediaId });
        toast({ title: "Обложка альбома установлена" });
        await loadData();
        onDataChange();
      }
    } catch (error) {
      toast({ title: "Ошибка установки обложки", variant: "destructive" });
    }
  };

  const filteredMedia = media.filter((item) => {
    // Фильтр по альбому
    let albumMatch = true;
    if (selectedAlbum === "none") {
      albumMatch = !item.albumId;
    } else if (selectedAlbum !== "all") {
      albumMatch = item.albumId === selectedAlbum;
    }

    // Фильтр по типу
    let typeMatch = true;
    if (filterType !== "all") {
      typeMatch = item.category === filterType;
    }

    return albumMatch && typeMatch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreateDemoData = async () => {
    try {
      await createDemoMediaData();
      toast({ title: "Демо-данные созданы" });
      await loadData();
      onDataChange();
    } catch (error) {
      toast({ title: "Ошибка создания демо-данных", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Управление альбомами */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Альбомы</CardTitle>
            <Dialog open={showAlbumForm} onOpenChange={setShowAlbumForm}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingAlbum(null);
                    setAlbumForm({});
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать альбом
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAlbum ? "Редактировать альбом" : "Создать альбом"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="album-name">Название</Label>
                    <Input
                      id="album-name"
                      value={albumForm.name || ""}
                      onChange={(e) =>
                        setAlbumForm({ ...albumForm, name: e.target.value })
                      }
                      placeholder="Введите название альбома"
                    />
                  </div>
                  <div>
                    <Label htmlFor="album-description">Описание</Label>
                    <Textarea
                      id="album-description"
                      value={albumForm.description || ""}
                      onChange={(e) =>
                        setAlbumForm({
                          ...albumForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Описание альбома"
                    />
                  </div>
                  <div>
                    <Label>Тип альбома</Label>
                    <Select
                      value={albumForm.type || "mixed"}
                      onValueChange={(value) =>
                        setAlbumForm({
                          ...albumForm,
                          type: value as Album["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Только фото</SelectItem>
                        <SelectItem value="video">Только видео</SelectItem>
                        <SelectItem value="mixed">Смешанный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAlbumForm(false)}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleSaveAlbum}>
                      {editingAlbum ? "Сохранить" : "Создать"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <div key={album.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <h3 className="font-medium">{album.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAlbum(album)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlbum(album.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {album.description && (
                  <p className="text-sm text-gray-600">{album.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      album.type === "photo"
                        ? "default"
                        : album.type === "video"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {album.type === "photo"
                      ? "Фото"
                      : album.type === "video"
                        ? "Видео"
                        : "Смешанный"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {album.itemCount} элементов
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Фильтры и загрузка */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Label>Альбом</Label>
              <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все файлы</SelectItem>
                  <SelectItem value="none">Без альбома</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Тип файла</Label>
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as typeof filterType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="photo">Только фото</SelectItem>
                  <SelectItem value="video">Только видео</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Загрузить файл</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center space-y-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                />
                <Label htmlFor="media-upload" className="cursor-pointer">
                  <Button asChild variant="outline">
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Выбрать файл
                    </span>
                  </Button>
                </Label>
                <div className="text-xs text-gray-500">или</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateDemoData}
                  className="text-xs"
                >
                  Создать демо-данные
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Галерея медиафайлов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Медиафайлы ({filteredMedia.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Сетка
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Список
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMedia.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className={
                    viewMode === "grid"
                      ? "border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                      : "border rounded-lg p-4 flex items-center gap-4"
                  }
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="relative aspect-video bg-gray-100">
                        {item.type === "image" ? (
                          <Image
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-200">
                            <div className="text-center">
                              <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <Play className="h-6 w-6 mx-auto text-gray-600" />
                            </div>
                          </div>
                        )}

                        {/* Тип файла */}
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant={
                              item.type === "image" ? "default" : "secondary"
                            }
                          >
                            {item.type === "image" ? "Фото" : "Видео"}
                          </Badge>
                        </div>

                        {/* Обложка альбома */}
                        {item.albumId &&
                          albums.find((a) => a.id === item.albumId)
                            ?.coverImageId === item.id && (
                            <div className="absolute top-2 right-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </div>
                          )}

                        {/* Действия при hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedMedia(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.albumId && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleSetAlbumCover(item.albumId!, item.id)
                                }
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString("ru-RU")}
                          </span>
                          {item.fileSize && (
                            <span className="text-xs text-gray-500">
                              {formatFileSize(item.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List view */}
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.type === "image" ? (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Video className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <Badge
                            variant={
                              item.type === "image" ? "default" : "secondary"
                            }
                          >
                            {item.type === "image" ? "Фото" : "Видео"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString("ru-RU")}
                          </span>
                          {item.fileSize && (
                            <span className="text-sm text-gray-500">
                              {formatFileSize(item.fileSize)}
                            </span>
                          )}
                          {item.duration && (
                            <span className="text-sm text-gray-500">
                              {formatDuration(item.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMedia(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.albumId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleSetAlbumCover(item.albumId!, item.id)
                            }
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMedia(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет медиафайлов
              </h3>
              <p className="text-gray-600">
                Загрузите изображения или видео для отображения здесь
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal для просмотра медиафайла */}
      {selectedMedia && (
        <Dialog
          open={!!selectedMedia}
          onOpenChange={() => setSelectedMedia(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-[60vh] overflow-hidden">
                {selectedMedia.type === "image" ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    width={800}
                    height={600}
                    className="max-w-full h-auto"
                  />
                ) : (
                  <video controls className="max-w-full max-h-full">
                    <source src={selectedMedia.url} type="video/mp4" />
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                )}
              </div>

              {selectedMedia.description && (
                <p className="text-gray-600">{selectedMedia.description}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {new Date(selectedMedia.date).toLocaleDateString("ru-RU")}
                </span>
                <div className="flex items-center gap-4">
                  {selectedMedia.fileSize && (
                    <span>{formatFileSize(selectedMedia.fileSize)}</span>
                  )}
                  {selectedMedia.dimensions && (
                    <span>
                      {selectedMedia.dimensions.width} ×{" "}
                      {selectedMedia.dimensions.height}
                    </span>
                  )}
                  {selectedMedia.duration && (
                    <span>{formatDuration(selectedMedia.duration)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = selectedMedia.url;
                    a.download = selectedMedia.title;
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
