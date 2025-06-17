"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import {
  Home,
  Save,
  Trash,
  Plus,
  ImageIcon,
  Settings,
  MapPin,
  Newspaper,
  Building,
  Info,
  Rss,
  LogOut,
  Upload,
  Edit,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { TouchButton } from "@/components/ui/touch-button";
import type { POI } from "@/types/poi";
import type { NewsItem } from "@/types/news";
import type { MediaItem, Album } from "@/types/media";
import type { SystemSettings } from "@/types/settings";
import { CATEGORIES, type POICategory } from "@/types/poi";
import {
  fetchPOIs,
  createPOI,
  updatePOI,
  removePOI,
  fetchNews,
  createNews,
  updateNews,
  removeNews,
  fetchMedia,
  removeMediaItem,
  fetchAlbums,
  createAlbum,
  updateAlbum,
  removeAlbum,
  fetchSettings,
  updateSettings,
  fetchRssFeeds,
  createRssFeed,
  updateRssFeed,
  removeRssFeed,
  fetchIcons,
  createIcon,
  updateIcon,
  removeIcon,
  uploadMediaFile,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface RssFeed {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

interface MarkerIcon {
  id: string;
  name: string;
  category: string;
  url: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pois");
  const [pois, setPois] = useState<POI[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [albumForm, setAlbumForm] = useState<Partial<Album>>({});
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [icons, setIcons] = useState<MarkerIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Состояния форм
  const [editingPoi, setEditingPoi] = useState<POI | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingRss, setEditingRss] = useState<RssFeed | null>(null);
  const [editingIcon, setEditingIcon] = useState<MarkerIcon | null>(null);

  // Формы
  const [poiForm, setPoiForm] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    address: "",
    category: "building",
    coordinates: [56.7417, 37.189] as [number, number],
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    image: "",
    url: "",
  });

  const [rssForm, setRssForm] = useState({
    name: "",
    url: "",
    active: true,
  });

  const [iconForm, setIconForm] = useState({
    name: "",
    category: "building",
  });

  const { toast } = useToast();
  const { language } = useLanguage();
  const router = useRouter();

  // Загрузка данных при монтировании
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthenticated = localStorage.getItem("admin_authenticated");
    const loginTime = localStorage.getItem("admin_login_time");

    if (!isAuthenticated || !loginTime) {
      router.push("/admin/login");
      return;
    }

    const sessionDuration = 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(loginTime) > sessionDuration) {
      localStorage.removeItem("admin_authenticated");
      localStorage.removeItem("admin_login_time");
      router.push("/admin/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        poisData,
        newsData,
        settingsData,
        mediaData,
        albumsData,
        rssData,
        iconsData,
      ] = await Promise.all([
        fetchPOIs(),
        fetchNews(),
        fetchSettings(),
        fetchMedia(),
        fetchAlbums(),
        fetchRssFeeds(),
        fetchIcons(),
      ]);

      setPois(poisData);
      setNews(newsData);
      setSettings(settingsData);
      setMedia(mediaData);
      setAlbums(albumsData);
      setRssFeeds(rssData);
      setIcons(iconsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_authenticated");
      localStorage.removeItem("admin_login_time");
    }
    router.push("/admin/login");
  };

  // Обработчики POI
  const handleSavePoi = async () => {
    try {
      const poi: POI = {
        id: editingPoi?.id || Date.now().toString(),
        ...poiForm,
        category: poiForm.category as POICategory,
        images: [],
      };

      if (editingPoi) {
        await updatePOI(editingPoi.id, poi);
        toast({ title: "Объект обновлен" });
      } else {
        await createPOI(poi);
        toast({ title: "Объект создан" });
      }

      setPoiForm({
        name: "",
        shortDescription: "",
        fullDescription: "",
        address: "",
        category: "building",
        coordinates: [56.7417, 37.189],
      });
      setEditingPoi(null);
      loadData();
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  const handleDeletePoi = async (id: string) => {
    try {
      await removePOI(id);
      toast({ title: "Объект удален" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleEditPoi = (poi: POI) => {
    setEditingPoi(poi);
    setPoiForm({
      name: poi.name,
      shortDescription: poi.shortDescription,
      fullDescription: poi.fullDescription,
      address: poi.address,
      category: poi.category,
      coordinates: poi.coordinates,
    });
  };

  // Обработчики новостей
  const handleSaveNews = async () => {
    try {
      const newsItem: NewsItem = {
        id: editingNews?.id || Date.now().toString(),
        ...newsForm,
        date: editingNews?.date || new Date().toISOString(),
      };

      if (editingNews) {
        await updateNews(editingNews.id, newsItem);
        toast({ title: "Новость обновлена" });
      } else {
        await createNews(newsItem);
        toast({ title: "Новость создана" });
      }

      setNewsForm({ title: "", content: "", image: "", url: "" });
      setEditingNews(null);
      loadData();
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await removeNews(id);
      toast({ title: "Новость удалена" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      title: newsItem.title,
      content: newsItem.content,
      image: newsItem.image || "",
      url: newsItem.url || "",
    });
  };

  // Обработчики RSS
  const handleSaveRss = async () => {
    try {
      const rssFeed: RssFeed = {
        id: editingRss?.id || Date.now().toString(),
        ...rssForm,
      };

      if (editingRss) {
        await updateRssFeed(editingRss.id, rssFeed);
        toast({ title: "RSS лента обновлена" });
      } else {
        await createRssFeed(rssFeed);
        toast({ title: "RSS лента добавлена" });
      }

      setRssForm({ name: "", url: "", active: true });
      setEditingRss(null);
      loadData();
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  const handleDeleteRss = async (id: string) => {
    try {
      await removeRssFeed(id);
      toast({ title: "RSS лента удалена" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleEditRss = (rssFeed: RssFeed) => {
    setEditingRss(rssFeed);
    setRssForm({
      name: rssFeed.name,
      url: rssFeed.url,
      active: rssFeed.active,
    });
  };

  // Обработчики медиафайлов
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem: MediaItem = {
        id: Date.now().toString(),
        title: file.name,
        description: "",
        type: file.type.startsWith("image/") ? "image" : "video",
        category: file.type.startsWith("image/") ? "photo" : "video",
        url: "",
        date: new Date().toISOString(),
      };

      await createMediaWithFile(mediaItem, file);
      toast({ title: "Медиафайл загружен" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await removeMedia(id);
      toast({ title: "Медиафайл удален" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  // Обработчики иконок
  const handleIconUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const icon: MarkerIcon = {
        id: Date.now().toString(),
        name: iconForm.name || file.name,
        category: iconForm.category,
        url: "",
      };

      await createIcon(icon, file);
      toast({ title: "Иконка загружена" });
      setIconForm({ name: "", category: "building" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      await removeIcon(id);
      toast({ title: "Иконка удалена" });
      loadData();
    } catch (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  // Обработчики настроек
  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      await updateSettings(settings);
      toast({ title: "Настройки сохранены" });
    } catch (error) {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    }
  };

  const handleOrganizationChange = (field: string, value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      organizationInfo: {
        ...settings.organizationInfo,
        [field]: value,
      },
    });
  };

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
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
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
          <TabsList className="grid w-full grid-cols-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingPoi
                      ? "Редактировать объект"
                      : "Добавить новый объект"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="poi-name">Название</Label>
                    <Input
                      id="poi-name"
                      value={poiForm.name}
                      onChange={(e) =>
                        setPoiForm({ ...poiForm, name: e.target.value })
                      }
                      placeholder="Введите название объекта"
                    />
                  </div>
                  <div>
                    <Label htmlFor="poi-short">Кратк��е описание</Label>
                    <Textarea
                      id="poi-short"
                      value={poiForm.shortDescription}
                      onChange={(e) =>
                        setPoiForm({
                          ...poiForm,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Краткое описание"
                    />
                  </div>
                  <div>
                    <Label htmlFor="poi-full">Полное описание</Label>
                    <Textarea
                      id="poi-full"
                      value={poiForm.fullDescription}
                      onChange={(e) =>
                        setPoiForm({
                          ...poiForm,
                          fullDescription: e.target.value,
                        })
                      }
                      placeholder="Полное описание"
                    />
                  </div>
                  <div>
                    <Label htmlFor="poi-address">Адрес</Label>
                    <Input
                      id="poi-address"
                      value={poiForm.address}
                      onChange={(e) =>
                        setPoiForm({ ...poiForm, address: e.target.value })
                      }
                      placeholder="Адрес объекта"
                    />
                  </div>
                  <div>
                    <Label>Категория</Label>
                    <Select
                      value={poiForm.category}
                      onValueChange={(value) =>
                        setPoiForm({ ...poiForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="poi-lat">Широта</Label>
                      <Input
                        id="poi-lat"
                        type="number"
                        step="0.000001"
                        value={poiForm.coordinates[0]}
                        onChange={(e) =>
                          setPoiForm({
                            ...poiForm,
                            coordinates: [
                              parseFloat(e.target.value),
                              poiForm.coordinates[1],
                            ],
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="poi-lng">Долгота</Label>
                      <Input
                        id="poi-lng"
                        type="number"
                        step="0.000001"
                        value={poiForm.coordinates[1]}
                        onChange={(e) =>
                          setPoiForm({
                            ...poiForm,
                            coordinates: [
                              poiForm.coordinates[0],
                              parseFloat(e.target.value),
                            ],
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button onClick={handleSavePoi}>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                  {editingPoi && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPoi(null);
                        setPoiForm({
                          name: "",
                          shortDescription: "",
                          fullDescription: "",
                          address: "",
                          category: "building",
                          coordinates: [56.7417, 37.189],
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* List */}
              <Card>
                <CardHeader>
                  <CardTitle>Существующие объекты ({pois.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {pois.map((poi) => (
                      <div
                        key={poi.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{poi.name}</h4>
                          <p className="text-sm text-gray-600">{poi.address}</p>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {CATEGORIES[poi.category as POICategory]?.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPoi(poi)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePoi(poi.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingNews ? "Редактировать новость" : "Добавить новость"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="news-title">Заголовок</Label>
                    <Input
                      id="news-title"
                      value={newsForm.title}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, title: e.target.value })
                      }
                      placeholder="Заголовок новости"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-content">Содержание</Label>
                    <Textarea
                      id="news-content"
                      value={newsForm.content}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, content: e.target.value })
                      }
                      placeholder="Содержание новости"
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-image">URL изображения</Label>
                    <Input
                      id="news-image"
                      value={newsForm.image}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, image: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-url">Ссылка на источник</Label>
                    <Input
                      id="news-url"
                      value={newsForm.url}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, url: e.target.value })
                      }
                      placeholder="https://example.com/article"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button onClick={handleSaveNews}>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                  {editingNews && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNews(null);
                        setNewsForm({
                          title: "",
                          content: "",
                          image: "",
                          url: "",
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* List */}
              <Card>
                <CardHeader>
                  <CardTitle>Новости ({news.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {news.map((newsItem) => (
                      <div
                        key={newsItem.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{newsItem.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {newsItem.content}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(newsItem.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditNews(newsItem)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNews(newsItem.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление медиафайлами</CardTitle>
                <CardDescription>
                  Загружайте изображения и видео для галереи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    className="hidden"
                    id="media-upload"
                  />
                  <Label htmlFor="media-upload" className="cursor-pointer">
                    <Button asChild>
                      <span>Загрузить файл</span>
                    </Button>
                  </Label>
                  <p className="text-sm text-gray-500 mt-2">
                    Поддерживаются изображения и видео
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Медиафайлы ({media.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="relative h-32 bg-gray-100">
                        {item.type === "image" ? (
                          <Image
                            src={item.url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500">{item.type}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => handleDeleteMedia(item.id)}
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RSS Tab */}
          <TabsContent value="rss" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRss
                      ? "Редактировать RSS ленту"
                      : "Добавить RSS ленту"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rss-name">Название</Label>
                    <Input
                      id="rss-name"
                      value={rssForm.name}
                      onChange={(e) =>
                        setRssForm({ ...rssForm, name: e.target.value })
                      }
                      placeholder="Название RSS ленты"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rss-url">URL RSS ленты</Label>
                    <Input
                      id="rss-url"
                      value={rssForm.url}
                      onChange={(e) =>
                        setRssForm({ ...rssForm, url: e.target.value })
                      }
                      placeholder="https://example.com/rss.xml"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rssForm.active}
                      onCheckedChange={(checked) =>
                        setRssForm({ ...rssForm, active: checked })
                      }
                    />
                    <Label>Активна</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button onClick={handleSaveRss}>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                  {editingRss && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingRss(null);
                        setRssForm({ name: "", url: "", active: true });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* List */}
              <Card>
                <CardHeader>
                  <CardTitle>RSS ленты ({rssFeeds.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {rssFeeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{feed.name}</h4>
                          <p className="text-sm text-gray-600">{feed.url}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${feed.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {feed.active ? "Активна" : "Неактивна"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRss(feed)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRss(feed.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Загрузить новую иконку</CardTitle>
                <CardDescription>
                  Загружайте пользовательские иконки для маркеров на карте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="icon-name">Название иконки</Label>
                  <Input
                    id="icon-name"
                    value={iconForm.name}
                    onChange={(e) =>
                      setIconForm({ ...iconForm, name: e.target.value })
                    }
                    placeholder="Назван��е иконки"
                  />
                </div>
                <div>
                  <Label>Категория</Label>
                  <Select
                    value={iconForm.category}
                    onValueChange={(value) =>
                      setIconForm({ ...iconForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="icon-file">Файл иконки</Label>
                  <input
                    type="file"
                    id="icon-file"
                    onChange={handleIconUpload}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Пользовательские иконки ({icons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {icons.map((icon) => (
                    <div
                      key={icon.id}
                      className="border rounded-lg p-3 text-center"
                    >
                      <div className="relative h-12 w-12 mx-auto mb-2">
                        <Image
                          src={icon.url}
                          alt={icon.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h4 className="text-sm font-medium">{icon.name}</h4>
                      <p className="text-xs text-gray-500">
                        {CATEGORIES[icon.category]?.name}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => handleDeleteIcon(icon.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {settings && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Информация об организации</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="org-name">Короткое название</Label>
                      <Input
                        id="org-name"
                        value={settings.organizationInfo.name}
                        onChange={(e) =>
                          handleOrganizationChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-full-name">Полное название</Label>
                      <Input
                        id="org-full-name"
                        value={settings.organizationInfo.fullName}
                        onChange={(e) =>
                          handleOrganizationChange("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-description">Описание</Label>
                      <Textarea
                        id="org-description"
                        value={settings.organizationInfo.description}
                        onChange={(e) =>
                          handleOrganizationChange(
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-address">Адрес</Label>
                      <Input
                        id="org-address"
                        value={settings.organizationInfo.address}
                        onChange={(e) =>
                          handleOrganizationChange("address", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-phone">Телефон</Label>
                      <Input
                        id="org-phone"
                        value={settings.organizationInfo.phone}
                        onChange={(e) =>
                          handleOrganizationChange("phone", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-email">Email</Label>
                      <Input
                        id="org-email"
                        value={settings.organizationInfo.email}
                        onChange={(e) =>
                          handleOrganizationChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-website">Веб-сайт</Label>
                      <Input
                        id="org-website"
                        value={settings.organizationInfo.website}
                        onChange={(e) =>
                          handleOrganizationChange("website", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-logo">URL логотипа</Label>
                      <Input
                        id="org-logo"
                        value={settings.organizationInfo.logo}
                        onChange={(e) =>
                          handleOrganizationChange("logo", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* System Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Системные настройки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="idle-timeout">
                        Время бездействия (минуты)
                      </Label>
                      <Input
                        id="idle-timeout"
                        type="number"
                        value={Math.round(settings.idleTimeout / (60 * 1000))}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            idleTimeout: parseInt(e.target.value) * 60 * 1000,
                          })
                        }
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Время бездействия после которого система вернется на
                        главный экран
                      </p>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Дополнительные настройки можно добавить по мере
                        необходимости:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Скринсейвер после времени бездействия</li>
                          <li>Звуки при нажатии кнопок</li>
                          <li>Анонимная статистика использования</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} size="lg">
                <Save className="h-4 w-4 mr-2" />
                Сохранить все настройки
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
