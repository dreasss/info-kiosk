"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import Link from "next/link";
import { TouchButton } from "@/components/ui/touch-button";
import type { POI } from "@/types/poi";
import type { NewsItem } from "@/types/news";
import type { MediaItem } from "@/types/media";
import type { SystemSettings, OrganizationInfo } from "@/types/settings";
import { CATEGORIES } from "@/types/poi";
import {
  fetchPOIs,
  fetchNews,
  fetchSettings,
  updateSettings,
  createPOI,
  createNews,
  createMedia,
  fetchMedia,
  removeMedia,
  fetchRssFeeds,
  createRssFeed,
  removeRssFeed,
  fetchIcons,
  createIcon,
  removeIcon,
  uploadMediaFile,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pois");
  const [pois, setPois] = useState<POI[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [rssFeeds, setRssFeeds] = useState<any[]>([]);
  const [icons, setIcons] = useState<any[]>([]);

  // Состояния форм
  const [currentPoi, setCurrentPoi] = useState<Partial<POI>>({
    name: "",
    shortDescription: "",
    fullDescription: "",
    coordinates: [56.7417, 37.189],
    images: [],
    address: "",
    category: "building",
  });

  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({
    title: "",
    content: "",
    image: "",
    date: new Date().toISOString(),
  });

  const [currentMedia, setCurrentMedia] = useState<Partial<MediaItem>>({
    title: "",
    description: "",
    type: "image",
    url: "",
    category: "photo",
    date: new Date().toISOString(),
  });

  const [rssUrl, setRssUrl] = useState("");
  const [rssName, setRssName] = useState("");
  const [organizationInfo, setOrganizationInfo] =
    useState<OrganizationInfo | null>(null);
  const [idleTimeout, setIdleTimeout] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [iconName, setIconName] = useState("");
  const [iconCategory, setIconCategory] = useState("building");

  const { toast } = useToast();
  const { language } = useLanguage();
  const router = useRouter();

  // Загрузка данных при монтировании
  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") {
      return;
    }

    const isAuthenticated = localStorage.getItem("admin_authenticated");
    const loginTime = localStorage.getItem("admin_login_time");

    if (!isAuthenticated || !loginTime) {
      router.push("/admin/login");
      return;
    }

    const sessionDuration = 24 * 60 * 60 * 1000;
    if (Date.now() - Number.parseInt(loginTime) > sessionDuration) {
      localStorage.removeItem("admin_authenticated");
      localStorage.removeItem("admin_login_time");
      router.push("/admin/login");
      return;
    }

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_login_time");
    router.push("/admin/login");
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [poisData, newsData, settingsData, mediaData, rssData, iconsData] =
        await Promise.all([
          fetchPOIs(),
          fetchNews(),
          fetchSettings(),
          fetchMedia(),
          fetchRssFeeds(),
          fetchIcons(),
        ]);

      setPois(poisData);
      setNews(newsData);
      setSettings(settingsData);
      setMedia(mediaData);
      setRssFeeds(rssData);
      setIcons(iconsData);
      setOrganizationInfo(settingsData.organizationInfo);
      setIdleTimeout(settingsData.idleTimeout / (60 * 1000));
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

  // Обработчики для POI
  const handlePoiInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentPoi((prev) => ({ ...prev, [name]: value }));
  };

  const handlePoiCategoryChange = (value: string) => {
    setCurrentPoi((prev) => ({ ...prev, category: value }));
  };

  const handleCoordinatesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = Number.parseFloat(e.target.value);
    setCurrentPoi((prev) => {
      const newCoordinates = [...(prev.coordinates || [56.7417, 37.189])];
      newCoordinates[index] = value;
      return { ...prev, coordinates: newCoordinates as [number, number] };
    });
  };

  const handleAddImage = () => {
    setCurrentPoi((prev) => ({
      ...prev,
      images: [...(prev.images || []), `/placeholder.svg?height=200&width=300`],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setCurrentPoi((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const handleSavePoi = async () => {
    if (!currentPoi.name || !currentPoi.coordinates) {
      toast({
        title: "Ошибка",
        description: "Название и координаты обязательны!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newPoi = await createPOI({
        name: currentPoi.name,
        shortDescription: currentPoi.shortDescription || "",
        fullDescription: currentPoi.fullDescription || "",
        coordinates: currentPoi.coordinates as [number, number],
        images: currentPoi.images || [],
        address: currentPoi.address || "",
        category: currentPoi.category || "building",
      });

      setPois((prev) => [...prev, newPoi]);

      // Сброс формы
      setCurrentPoi({
        name: "",
        shortDescription: "",
        fullDescription: "",
        coordinates: [56.7417, 37.189],
        images: [],
        address: "",
        category: "building",
      });

      toast({
        title: "Успешно",
        description: "Объект сохранен в базу данных!",
      });
    } catch (error) {
      console.error("Error saving POI:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить объект",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для новостей
  const handleNewsInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentNews((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNews = async () => {
    if (!currentNews.title || !currentNews.content) {
      toast({
        title: "Ошибка",
        description: "Заголовок и содержание обязательны!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newNews = await createNews({
        title: currentNews.title,
        content: currentNews.content,
        image: currentNews.image || "/placeholder.svg?height=200&width=300",
        date: currentNews.date || new Date().toISOString(),
        url: currentNews.url,
      });

      setNews((prev) => [newNews, ...prev]);

      // Сброс формы
      setCurrentNews({
        title: "",
        content: "",
        image: "",
        date: new Date().toISOString(),
      });

      toast({
        title: "Успешно",
        description: "Новость сохранена в базу данных!",
      });
    } catch (error) {
      console.error("Error saving news:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить новость",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для медиафайлов
  const handleMediaInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentMedia((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const url = await uploadMediaFile(file);
      setCurrentMedia((prev) => ({ ...prev, url }));

      toast({
        title: "Успешно",
        description: "Файл загружен!",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedia = async () => {
    if (!currentMedia.title || !currentMedia.url) {
      toast({
        title: "Ошибка",
        description: "Название и файл обязательны!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newMedia = await createMedia({
        title: currentMedia.title,
        description: currentMedia.description || "",
        type: currentMedia.type || "image",
        url: currentMedia.url,
        category: currentMedia.category || "photo",
        date: new Date().toISOString(),
      });

      setMedia((prev) => [...prev, newMedia]);

      // Сброс формы
      setCurrentMedia({
        title: "",
        description: "",
        type: "image",
        url: "",
        category: "photo",
        date: new Date().toISOString(),
      });

      toast({
        title: "Успешно",
        description: "Медиафайл сохранен в базу данных!",
      });
    } catch (error) {
      console.error("Error saving media:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить медиафайл",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      setIsLoading(true);
      await removeMedia(id);
      setMedia((prev) => prev.filter((m) => m.id !== id));

      toast({
        title: "Успешно",
        description: "Медиафайл удален!",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить медиафайл",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для настроек
  const handleOrganizationInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setOrganizationInfo((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveSettings = async () => {
    if (!settings || !organizationInfo) return;

    try {
      setIsLoading(true);
      const updatedSettings = await updateSettings({
        ...settings,
        idleTimeout: idleTimeout * 60 * 1000,
        organizationInfo,
      });

      setSettings(updatedSettings);

      toast({
        title: "Успешно",
        description: "Настройки сохранены в базу данных!",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для RSS
  const handleSaveRssUrl = async () => {
    if (!rssUrl || !rssName) {
      toast({
        title: "Ошибка",
        description: "Название и URL RSS-ленты обязательны",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newFeed = await createRssFeed({
        name: rssName,
        url: rssUrl,
        active: true,
      });

      setRssFeeds((prev) => [...prev, newFeed]);
      setRssUrl("");
      setRssName("");

      toast({
        title: "Успешно",
        description: "RSS-лента добавлена в базу данных!",
      });
    } catch (error) {
      console.error("Error saving RSS feed:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить RSS-ленту",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRssFeed = async (id: string) => {
    try {
      setIsLoading(true);
      await removeRssFeed(id);
      setRssFeeds((prev) => prev.filter((f) => f.id !== id));

      toast({
        title: "Успешно",
        description: "RSS-лента удалена!",
      });
    } catch (error) {
      console.error("Error deleting RSS feed:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить RSS-ленту",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для иконок
  const handleIconFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !iconName) {
      toast({
        title: "Ошибка",
        description: "Выберите файл и введите название иконки",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newIcon = await createIcon(
        {
          name: iconName,
          category: iconCategory,
          url: "",
        },
        file,
      );

      setIcons((prev) => [...prev, newIcon]);
      setIconName("");

      toast({
        title: "Успешно",
        description: "Иконка загружена в базу данных!",
      });
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить иконку",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      setIsLoading(true);
      await removeIcon(id);
      setIcons((prev) => prev.filter((i) => i.id !== id));

      toast({
        title: "Успешно",
        description: "Иконка удалена!",
      });
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить иконку",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <div className="flex gap-4">
          <TouchButton asChild touchSize="lg" variant="outline">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              На главную
            </Link>
          </TouchButton>
          <TouchButton
            onClick={handleLogout}
            touchSize="lg"
            variant="destructive"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Выйти
          </TouchButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="pois" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Объекты
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Новости
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Медиа
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Брендинг
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* Вкладка объектов */}
        <TabsContent value="pois" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новый объект</CardTitle>
                <CardDescription>
                  Заполните информацию о новом объекте на карте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentPoi.name}
                    onChange={handlePoiInputChange}
                    placeholder="Название объекта"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={currentPoi.category}
                    onValueChange={handlePoiCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Краткое описание</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={currentPoi.shortDescription}
                    onChange={handlePoiInputChange}
                    placeholder="Краткое описание для всплывающего окна"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Полное описание</Label>
                  <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    value={currentPoi.fullDescription}
                    onChange={handlePoiInputChange}
                    placeholder="Полное описание объекта"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Координаты *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="lat" className="text-xs">
                        Широта
                      </Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.0001"
                        value={currentPoi.coordinates?.[0]}
                        onChange={(e) => handleCoordinatesChange(e, 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng" className="text-xs">
                        Долгота
                      </Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.0001"
                        value={currentPoi.coordinates?.[1]}
                        onChange={(e) => handleCoordinatesChange(e, 1)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    name="address"
                    value={currentPoi.address}
                    onChange={handlePoiInputChange}
                    placeholder="Полный адрес объекта"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Изображения</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddImage}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Добавить
                    </Button>
                  </div>

                  {currentPoi.images && currentPoi.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {currentPoi.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative border rounded p-2"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs truncate">{image}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Нет добавленных изображений
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSavePoi}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Сохранение..." : "Сохранить объект"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сохраненные объекты ({pois.length})</CardTitle>
                <CardDescription>Список объектов в базе данных</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {pois.length > 0 ? (
                    <div className="space-y-4">
                      {pois.map((poi) => (
                        <div key={poi.id} className="border rounded p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{poi.name}</h3>
                            <div
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{
                                backgroundColor: CATEGORIES[poi.category].color,
                              }}
                            >
                              {CATEGORIES[poi.category].name}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>
                              {poi.coordinates[0].toFixed(4)},{" "}
                              {poi.coordinates[1].toFixed(4)}
                            </span>
                          </div>
                          <p className="text-sm mt-2">{poi.shortDescription}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Нет сохраненных объектов
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка новостей */}
        <TabsContent value="news" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новость</CardTitle>
                <CardDescription>
                  Создайте новую новость для отображения на сайте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newsTitle">Заголовок *</Label>
                  <Input
                    id="newsTitle"
                    name="title"
                    value={currentNews.title}
                    onChange={handleNewsInputChange}
                    placeholder="Заголовок новости"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsContent">Содержание *</Label>
                  <Textarea
                    id="newsContent"
                    name="content"
                    value={currentNews.content}
                    onChange={handleNewsInputChange}
                    placeholder="Текст новости"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsImage">Изображение</Label>
                  <Input
                    id="newsImage"
                    name="image"
                    value={currentNews.image}
                    onChange={handleNewsInputChange}
                    placeholder="URL изображения"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsUrl">Ссылка (опционально)</Label>
                  <Input
                    id="newsUrl"
                    name="url"
                    value={currentNews.url}
                    onChange={handleNewsInputChange}
                    placeholder="URL для дополнительной информации"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveNews}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Сохранение..." : "Сохранить новость"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сохраненные новости ({news.length})</CardTitle>
                <CardDescription>Список новостей в базе данных</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {news.length > 0 ? (
                    <div className="space-y-4">
                      {news.map((item) => (
                        <div key={item.id} className="border rounded p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{item.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-2 line-clamp-3">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Нет сохраненных новостей
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Настройки RSS-ленты</CardTitle>
                <CardDescription>
                  Добавьте внешние источники новостей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={rssName}
                    onChange={(e) => setRssName(e.target.value)}
                    placeholder="Название ленты"
                  />
                  <Input
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    placeholder="URL RSS-ленты"
                  />
                  <Button onClick={handleSaveRssUrl} disabled={isLoading}>
                    <Rss className="h-4 w-4 mr-2" />
                    {isLoading ? "Добавление..." : "Добавить"}
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">
                    Добавленные RSS-ленты ({rssFeeds.length}):
                  </h4>
                  <div className="space-y-2">
                    {rssFeeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Rss className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{feed.name}</span>
                          <span className="text-sm text-gray-500">
                            ({feed.url})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteRssFeed(feed.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    {rssFeeds.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Нет добавленных RSS-лент
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка медиа */}
        <TabsContent value="media" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Управление медиафайлами</CardTitle>
                <CardDescription>
                  Загрузка фото, видео и GIF для галереи
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaTitle">Название *</Label>
                  <Input
                    id="mediaTitle"
                    name="title"
                    value={currentMedia.title}
                    onChange={handleMediaInputChange}
                    placeholder="Название медиафайла"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaDescription">Описание</Label>
                  <Textarea
                    id="mediaDescription"
                    name="description"
                    value={currentMedia.description}
                    onChange={handleMediaInputChange}
                    placeholder="Описание медиафайла"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тип медиафайла</Label>
                  <Select
                    value={currentMedia.type}
                    onValueChange={(value) =>
                      setCurrentMedia((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Изображение</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select
                    value={currentMedia.category}
                    onValueChange={(value) =>
                      setCurrentMedia((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Фото</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaFile">Файл *</Label>
                  <Input
                    id="mediaFile"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaFileUpload}
                    required
                  />
                  {currentMedia.url && (
                    <p className="text-sm text-green-600">
                      Файл загружен: {currentMedia.url}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSaveMedia}
                  className="w-full"
                  disabled={isLoading || !currentMedia.url}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Сохранение..." : "Добавить медиафайл"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Загруженные медиафайлы ({media.length})</CardTitle>
                <CardDescription>
                  Управление загруженными медиафайлами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-2 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                          {item.type === "image" ? (
                            <Image
                              src={
                                item.url ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={item.title}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              className="w-full h-full object-cover"
                              controls
                            >
                              <source src={item.url} type="video/mp4" />
                            </video>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.type}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDeleteMedia(item.id)}
                          >
                            <Trash className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {media.length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-muted-foreground">
                          Нет загруженных медиафайлов
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка брендинга */}
        <TabsContent value="branding" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Настройки брендинга</CardTitle>
                <CardDescription>
                  Настройте информацию об организации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizationInfo && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Название организации</Label>
                      <Input
                        id="name"
                        name="name"
                        value={organizationInfo.name}
                        onChange={handleOrganizationInfoChange}
                        placeholder="Краткое название организации"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Полное название</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={organizationInfo.fullName}
                        onChange={handleOrganizationInfoChange}
                        placeholder="Полное официальное название"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Логотип</Label>
                      <Input
                        id="logo"
                        name="logo"
                        value={organizationInfo.logo}
                        onChange={handleOrganizationInfoChange}
                        placeholder="URL логотипа"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={organizationInfo.description}
                        onChange={handleOrganizationInfoChange}
                        placeholder="Краткое описание организации"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        name="address"
                        value={organizationInfo.address}
                        onChange={handleOrganizationInfoChange}
                        placeholder="Юридический адрес"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={organizationInfo.phone}
                          onChange={handleOrganizationInfoChange}
                          placeholder="Контактный телефон"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={organizationInfo.email}
                          onChange={handleOrganizationInfoChange}
                          placeholder="Электронная почта"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Веб-сайт</Label>
                      <Input
                        id="website"
                        name="website"
                        value={organizationInfo.website}
                        onChange={handleOrganizationInfoChange}
                        placeholder="URL веб-сайта"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading
                    ? "Сохранение..."
                    : "Сохранить настройки брендинга"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Предварительный просмотр</CardTitle>
                <CardDescription>
                  Как будет выглядеть информация на сайте
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizationInfo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-sky-400 rounded-lg text-white">
                      <Image
                        src={organizationInfo.logo || "/images/jinr-logo.png"}
                        alt="Logo"
                        width={50}
                        height={50}
                        className="rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold">{organizationInfo.name}</h3>
                        <p className="text-sm opacity-90">
                          {organizationInfo.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Описание:</h4>
                      <p className="text-sm text-gray-600">
                        {organizationInfo.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>📍 {organizationInfo.address}</div>
                      <div>📞 {organizationInfo.phone}</div>
                      <div>✉️ {organizationInfo.email}</div>
                      <div>🌐 {organizationInfo.website}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка настроек */}
        <TabsContent value="settings" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>
                  Настройте основные параметры системы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idleTimeout">
                    Время бездействия (минуты)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="idleTimeout"
                      type="number"
                      min="1"
                      max="60"
                      value={idleTimeout}
                      onChange={(e) =>
                        setIdleTimeout(Number.parseInt(e.target.value))
                      }
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      минут
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Время бездействия, после которого система автоматически
                    вернется на главный экран
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableScreensaver">
                      Включить скринсейвер
                    </Label>
                    <Switch id="enableScreensaver" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Показывать скринсейвер после указанного времени бездействия
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableTouchSounds">Звуки при нажатии</Label>
                    <Switch id="enableTouchSounds" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Воспроизводить звук при нажатии на кнопки
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableAnalytics">Сбор аналитики</Label>
                    <Switch id="enableAnalytics" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Собирать анонимную статистику использования для улучшения
                    системы
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Сохранение..." : "Сохранить настройки"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Пользовательские иконки маркеров</CardTitle>
                <CardDescription>
                  Загрузка собственных иконок для маркеров на карте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iconName">Название иконки</Label>
                  <Input
                    id="iconName"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    placeholder="Например: Лаборатория"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iconCategory">Категория</Label>
                  <Select value={iconCategory} onValueChange={setIconCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iconFile">
                    Файл иконки (PNG, SVG, 32x32px)
                  </Label>
                  <Input
                    id="iconFile"
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={handleIconFileUpload}
                  />
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">
                    Загруженные иконки ({icons.length}):
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {icons.map((icon) => (
                      <div
                        key={icon.id}
                        className="border rounded p-2 text-center relative group"
                      >
                        <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded flex items-center justify-center">
                          {icon.url ? (
                            <Image
                              src={icon.url || "/placeholder.svg"}
                              alt={icon.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          ) : (
                            <span className="text-xs">?</span>
                          )}
                        </div>
                        <span className="text-xs">{icon.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteIcon(icon.id)}
                        >
                          <Trash className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    {icons.length === 0 && (
                      <div className="col-span-4 text-center py-4">
                        <p className="text-sm text-gray-500">
                          Нет загруженных иконок
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Системная информация</CardTitle>
                <CardDescription>
                  Информация о системе и статистика использования
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Версия системы
                    </h4>
                    <p className="text-lg font-semibold">1.0.0</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Объектов в БД
                    </h4>
                    <p className="text-lg font-semibold">{pois.length}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Новостей в БД
                    </h4>
                    <p className="text-lg font-semibold">{news.length}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Медиафайлов в БД
                    </h4>
                    <p className="text-lg font-semibold">{media.length}</p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Все данные сохраняются в локальной базе данных браузера
                    (IndexedDB). Для применения некоторых настроек может
                    потребоваться перезагрузка системы.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
