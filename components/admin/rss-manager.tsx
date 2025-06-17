"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Rss, Edit, Trash2, Plus, Save, ExternalLink } from "lucide-react";
import {
  fetchRssFeeds,
  createRssFeed,
  updateRssFeed,
  removeRssFeed,
  type RssFeed,
} from "@/lib/api";
import { createDemoRssFeeds } from "@/lib/demo-media";

interface RssManagerProps {
  onDataChange?: () => void;
}

export function RssManager({ onDataChange }: RssManagerProps) {
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    active: true,
  });

  const loadRssFeeds = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRssFeeds();
      setRssFeeds(data);
    } catch (error) {
      console.error("Error loading RSS feeds:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить RSS ленты",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRssFeeds();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      active: true,
    });
    setEditingFeed(null);
    setIsEditing(false);
  };

  const handleEdit = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      url: feed.url,
      active: feed.active,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.url.trim()) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Название и URL обязательны для заполнения",
        });
        return;
      }

      if (!validateUrl(formData.url)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Введите корректный URL",
        });
        return;
      }

      const feedData = {
        name: formData.name,
        url: formData.url,
        active: formData.active,
      };

      if (isEditing && editingFeed) {
        await updateRssFeed(editingFeed.id, feedData);
        toast({
          title: "Успех",
          description: "RSS лента успешно обновлена",
        });
      } else {
        await createRssFeed(feedData);
        toast({
          title: "Успех",
          description: "RSS лента успешно создана",
        });
      }

      await loadRssFeeds();
      setIsDialogOpen(false);
      resetForm();
      onDataChange?.();
    } catch (error) {
      console.error("Error saving RSS feed:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить RSS ленту",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту RSS ленту?")) {
      return;
    }

    try {
      await removeRssFeed(id);
      await loadRssFeeds();
      toast({
        title: "Успех",
        description: "RSS лента успешно удалена",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error deleting RSS feed:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить RSS ленту",
      });
    }
  };

  const createDemoFeeds = async () => {
    try {
      await createDemoRssFeeds();
      await loadRssFeeds();
      toast({
        title: "Успех",
        description: "Демо RSS ленты созданы",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error creating demo RSS feeds:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать демо RSS ленты",
      });
    }
  };

  const cleanProblematicFeeds = async () => {
    try {
      const problematicDomains = ["rt.com", "tass.com"];
      const allFeeds = await fetchRssFeeds();

      for (const feed of allFeeds) {
        try {
          const url = new URL(feed.url);
          if (
            problematicDomains.some((domain) => url.hostname.includes(domain))
          ) {
            await removeRssFeed(feed.id);
            console.log(`Removed problematic feed: ${feed.name}`);
          }
        } catch (error) {
          console.error(`Error processing feed ${feed.name}:`, error);
        }
      }

      await loadRssFeeds();
      toast({
        title: "Успех",
        description: "Проблемные RSS ленты удалены",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error cleaning feeds:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось очистить RSS ленты",
      });
    }
  };

  const toggleFeedActive = async (feed: RssFeed) => {
    try {
      await updateRssFeed(feed.id, { ...feed, active: !feed.active });
      await loadRssFeeds();
      toast({
        title: "Успех",
        description: `RSS лента ${!feed.active ? "активирована" : "деактивирована"}`,
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error toggling RSS feed:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить статус RSS ленты",
      });
    }
  };

  const filteredFeeds = rssFeeds.filter(
    (feed) =>
      feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeFeeds = rssFeeds.filter((feed) => feed.active);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка RSS лент...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Rss className="h-5 w-5 mr-2" />
              Управление RSS лентами ({rssFeeds.length})
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить RSS ленту
                </Button>
              </DialogTrigger>
              <Button variant="outline" onClick={() => createDemoFeeds()}>
                Создать демо ленты
              </Button>
              <Button variant="outline" onClick={() => cleanProblematicFeeds()}>
                Очистить проблемные
              </Button>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing
                      ? "Редактировать RSS ленту"
                      : "Создать новую RSS ленту"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Название RSS ленты"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">URL RSS ленты</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/rss.xml"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, active: checked }))
                      }
                    />
                    <Label htmlFor="active">Активная лента</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Input
                placeholder="Поиск RSS лент..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="text-sm text-gray-600">
                Активных лент: {activeFeeds.length} из {rssFeeds.length}
              </div>
            </div>
          </div>

          {rssFeeds.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Информация о бегущей строке</h4>
              <p className="text-sm text-gray-600">
                RSS ленты отображаются в виде бегущей строки на главном экране.
                Активные ленты автоматически обновляются и показывают последние
                новости.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {filteredFeeds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {rssFeeds.length === 0 ? (
                  <div>
                    <p className="mb-4">RSS ленты не найдены</p>
                    <p className="text-sm">
                      Добавьте RSS ленты для отображения новостей в бегущей
                      строке на главном экране
                    </p>
                  </div>
                ) : (
                  "RSS ленты не найдены по поисковому запросу"
                )}
              </div>
            ) : (
              filteredFeeds.map((feed) => (
                <Card key={feed.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{feed.name}</h3>
                        <Badge variant={feed.active ? "default" : "secondary"}>
                          {feed.active ? "Активная" : "Неактивная"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ExternalLink className="h-3 w-3" />
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 break-all"
                        >
                          {feed.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={feed.active}
                        onCheckedChange={() => toggleFeedActive(feed)}
                        size="sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(feed)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(feed.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
