"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  MapPin,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  Save,
  X,
  Upload,
} from "lucide-react";
import type { POI, POICategory } from "@/types/poi";
import { CATEGORIES } from "@/types/poi";
import { fetchPOIs, createPOI, updatePOI, removePOI } from "@/lib/api";

interface POIManagerProps {
  onDataChange?: () => void;
}

export function POIManager({ onDataChange }: POIManagerProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<POICategory | "all">(
    "all",
  );
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    coordinates: "" as string,
    address: "",
    category: "building" as POICategory,
    images: [] as string[],
    iconUrl: "",
  });

  const loadPOIs = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPOIs();
      setPois(data);
    } catch (error) {
      console.error("Error loading POIs:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить объекты",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPOIs();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      shortDescription: "",
      fullDescription: "",
      coordinates: "",
      address: "",
      category: "building",
      images: [],
      iconUrl: "",
    });
    setEditingPOI(null);
    setIsEditing(false);
  };

  const handleEdit = (poi: POI) => {
    setEditingPOI(poi);
    setFormData({
      name: poi.name,
      shortDescription: poi.shortDescription,
      fullDescription: poi.fullDescription,
      coordinates: poi.coordinates.join(", "),
      address: poi.address,
      category: poi.category,
      images: poi.images || [],
      iconUrl: poi.iconUrl || "",
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
      const coordinatesArray = formData.coordinates
        .split(",")
        .map((coord) => parseFloat(coord.trim()));

      if (coordinatesArray.length !== 2 || coordinatesArray.some(isNaN)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Координаты должны быть в формате: широта, долгота",
        });
        return;
      }

      const poiData = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        coordinates: coordinatesArray as [number, number],
        address: formData.address,
        category: formData.category,
        images: formData.images,
        iconUrl: formData.iconUrl,
      };

      if (isEditing && editingPOI) {
        await updatePOI(editingPOI.id, poiData);
        toast({
          title: "Успех",
          description: "Объект успешно обновлен",
        });
      } else {
        await createPOI(poiData);
        toast({
          title: "Успех",
          description: "Объект успешно создан",
        });
      }

      await loadPOIs();
      setIsDialogOpen(false);
      resetForm();
      onDataChange?.();
    } catch (error) {
      console.error("Error saving POI:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить объект",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот объект?")) {
      return;
    }

    try {
      await removePOI(id);
      await loadPOIs();
      toast({
        title: "Успех",
        description: "Объект успешно удален",
      });
      onDataChange?.();
    } catch (error) {
      console.error("Error deleting POI:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить объект",
      });
    }
  };

  const addImage = () => {
    const url = prompt("Введите URL изображения:");
    if (url) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
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
            images: [...prev.images, result],
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

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const filteredPOIs = pois.filter((poi) => {
    const matchesSearch =
      poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || poi.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка объектов...</span>
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
              <MapPin className="h-5 w-5 mr-2" />
              Управление объектами ({pois.length})
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить объект
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing
                      ? "Редактировать объект"
                      : "Создать новый объект"}
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
                      placeholder="Название объекта"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: POICategory) =>
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
                    <Label htmlFor="shortDescription">Краткое описание</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shortDescription: e.target.value,
                        }))
                      }
                      placeholder="Краткое описание объекта"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullDescription">Полное описание</Label>
                    <Textarea
                      id="fullDescription"
                      value={formData.fullDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullDescription: e.target.value,
                        }))
                      }
                      placeholder="Подробное описание объекта"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coordinates">Координаты</Label>
                    <Input
                      id="coordinates"
                      value={formData.coordinates}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: e.target.value,
                        }))
                      }
                      placeholder="56.7458, 37.189"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Адрес объекта"
                    />
                  </div>

                  <div>
                    <Label htmlFor="iconUrl">URL иконки</Label>
                    <Input
                      id="iconUrl"
                      value={formData.iconUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          iconUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/icon.png"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Изображения</Label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить
                        </Button>
                        <Button type="button" size="sm" onClick={addImage}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          URL
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input value={image} readOnly className="flex-1" />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Поиск объектов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value: POICategory | "all") =>
                setSelectedCategory(value)
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredPOIs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Объекты не найдены
              </div>
            ) : (
              filteredPOIs.map((poi) => (
                <Card key={poi.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{poi.name}</h3>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor:
                              CATEGORIES[poi.category].color + "20",
                            color: CATEGORIES[poi.category].color,
                          }}
                        >
                          {CATEGORIES[poi.category].name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {poi.shortDescription}
                      </p>
                      <p className="text-xs text-gray-500">
                        📍 {poi.address} | 🗺️ {poi.coordinates.join(", ")}
                      </p>
                      {poi.images && poi.images.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          🖼️ {poi.images.length} изображений
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(poi)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(poi.id)}
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
