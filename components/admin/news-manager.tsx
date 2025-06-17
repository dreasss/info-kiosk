"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Newspaper,
  Edit,
  Trash2,
  Plus,
  Save,
  Calendar,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import type { NewsItem } from "@/types/news";
import { fetchNews, createNews, updateNews, removeNews } from "@/lib/api";

interface NewsManagerProps {
  onDataChange?: () => void;
}

export function NewsManager({ onDataChange }: NewsManagerProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    url: "",
  });

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const data = await fetchNews();
      setNews(data);
    } catch (error) {
      console.error("Error loading news:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить новости",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: "",
      url: "",
    });
    setEditingNews(null);
    setIsEditing(false);
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image: newsItem.image || "",
      url: newsItem.url || "",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Заголовок и содержание обязательны для заполнения",
        });
        return;
      }

      const newsData = {
        title: formData.title,
        content: formData.content,
        image: formData.image,
        url: formData.url,
        date: editingNews?.date || new Date().toISOString(),
      };

      if (isEditing && editingNews) {
        await updateNews(editingNews.id, newsData);
        toast({
          title: "Успех",
          description: "Новость успешно обновлена",
        });
      } else {
        await createNews(newsData);
        toast({
          title: "Успех",
          description: "Новость успешно создана",
        });
      }

      await loadNews();
      setIsDialogOpen(false);
      resetForm();
      onDataChange?.();
    } catch (error) {
      console.error("Error saving news:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить новость",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            image: result,
          }));
          toast({
            title: "Успех",
            description: "Изображение загружено",
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите файл изображения",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) {
      return;
    }

    try {
      await removeNews(id);
      await loadNews();
      toast({
        title: "Успех",
        description: "Новость успешно удалена",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error deleting news:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить новость",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка новостей...</span>
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
              <Newspaper className="h-5 w-5 mr-2" />
              Управление новостями ({news.length})
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить новость
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing
                      ? "Редактировать новость"
                      : "Создать новую новость"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Заголовок новости"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Содержание</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Текст новости"
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Изображение</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="news-image-upload"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("news-image-upload")
                              ?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить с компьютера
                        </Button>
                      </div>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image: e.target.value,
                          }))
                        }
                        placeholder="или введите URL изображения"
                      />
                      {formData.image && (
                        <div className="mt-2 p-2 border rounded-lg">
                          <img
                            src={formData.image}
                            alt="Предварительный просмотр"
                            className="max-w-full h-32 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="url">Ссылка (необязательно)</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/article"
                    />
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
            <Input
              placeholder="Поиск новостей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Новости не найдены
              </div>
            ) : (
              filteredNews.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.image && (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                        {item.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.date)}
                        </span>
                        {item.url && <span>🔗 Внешняя ссылка</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
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
