"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Building,
  Edit,
  Trash2,
  Plus,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  fetchIcons,
  createIcon,
  updateIcon,
  removeIcon,
  type MarkerIcon,
} from "@/lib/api";
import { CATEGORIES } from "@/types/poi";

interface IconManagerProps {
  onDataChange?: () => void;
}

export function IconManager({ onDataChange }: IconManagerProps) {
  const [icons, setIcons] = useState<MarkerIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIcon, setEditingIcon] = useState<MarkerIcon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "building",
    url: "",
  });

  const loadIcons = async () => {
    try {
      setIsLoading(true);
      const data = await fetchIcons();
      setIcons(data);
    } catch (error) {
      console.error("Error loading icons:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить иконки",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIcons();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "building",
      url: "",
    });
    setEditingIcon(null);
    setIsEditing(false);
  };

  const handleEdit = (icon: MarkerIcon) => {
    setEditingIcon(icon);
    setFormData({
      name: icon.name,
      category: icon.category,
      url: icon.url,
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

  const handleFileUpload = async (file: File) => {
    try {
      // Создаем blob URL для предварительного просмотра
      const blobUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, url: blobUrl }));

      toast({
        title: "Файл загружен",
        description: "Файл готов к сохранению",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить файл",
      });
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

      if (!formData.url.startsWith("blob:") && !validateUrl(formData.url)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Введите корректный URL",
        });
        return;
      }

      const iconData = {
        name: formData.name,
        category: formData.category,
        url: formData.url,
      };

      if (isEditing && editingIcon) {
        await updateIcon(editingIcon.id, iconData);
        toast({
          title: "Успех",
          description: "Иконка успешно обновлена",
        });
      } else {
        await createIcon(iconData);
        toast({
          title: "Успех",
          description: "Иконка успешно создана",
        });
      }

      await loadIcons();
      setIsDialogOpen(false);
      resetForm();
      onDataChange?.();
    } catch (error) {
      console.error("Error saving icon:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить иконку",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту иконку?")) {
      return;
    }

    try {
      await removeIcon(id);
      await loadIcons();
      toast({
        title: "Успех",
        description: "Иконка успешно удалена",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить иконку",
      });
    }
  };

  const filteredIcons = icons.filter((icon) => {
    const matchesSearch = icon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = icons.reduce(
    (acc, icon) => {
      acc[icon.category] = (acc[icon.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка иконок...</span>
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
              <Building className="h-5 w-5 mr-2" />
              Управление иконками маркеров ({icons.length})
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить иконку
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing
                      ? "Редактировать иконку"
                      : "Создать новую иконку"}
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
                      placeholder="Название иконки"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                          <SelectItem key={key} value={key}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Файл иконки</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить файл
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">или</div>
                      <Input
                        value={formData.url}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            url: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/icon.png"
                      />
                    </div>
                  </div>

                  {formData.url && (
                    <div>
                      <Label>Предварительный просмотр</Label>
                      <div className="flex items-center justify-center p-4 border rounded-lg">
                        <img
                          src={formData.url}
                          alt="Предварительный просмотр"
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden",
                            );
                          }}
                        />
                        <div className="hidden text-gray-400">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      </div>
                    </div>
                  )}

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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Поиск иконок..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name} ({categoryCounts[key] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {icons.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">
                Информация об иконках маркеров
              </h4>
              <p className="text-sm text-gray-600">
                Иконки используются для отображения различных типов объектов на
                карте. Каждая категория объектов может иметь свою уникальную
                иконку.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {icons.length === 0 ? (
                  <div>
                    <p className="mb-4">Иконки не найдены</p>
                    <p className="text-sm">
                      Добавьте иконки для отображения маркеров различных
                      категорий на карте
                    </p>
                  </div>
                ) : (
                  "Иконки не найдены по поисковому запросу"
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIcons.map((icon) => (
                  <Card key={icon.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={icon.url}
                          alt={icon.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden",
                            );
                          }}
                        />
                        <div className="hidden text-gray-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{icon.name}</h3>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor:
                              CATEGORIES[
                                icon.category as keyof typeof CATEGORIES
                              ]?.color + "20",
                            color:
                              CATEGORIES[
                                icon.category as keyof typeof CATEGORIES
                              ]?.color,
                          }}
                        >
                          {CATEGORIES[icon.category as keyof typeof CATEGORIES]
                            ?.name || icon.category}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(icon)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(icon.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
