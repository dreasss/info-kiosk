"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Save,
  Upload,
  Calendar,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { getTimerSettings, saveTimerSettings } from "@/lib/db";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import type { EventTimer } from "@/types/timer";

interface TimerManagerProps {
  onDataChange?: () => void;
}

export function TimerManager({ onDataChange }: TimerManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<EventTimer>({
    id: "",
    title: "",
    description: "",
    eventDate: "",
    image: "",
    enabled: false,
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
  });

  const loadTimerSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await getTimerSettings();

      if (settings.timer) {
        setFormData(settings.timer);
        setTimerEnabled(settings.enabled);
      } else {
        setTimerEnabled(settings.enabled || false);
      }
    } catch (error) {
      console.error("Error loading timer settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить настройки таймера",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimerSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (!formData.title.trim() || !formData.eventDate) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Заголовок и дата события обязательны для заполнения",
        });
        return;
      }

      const settings = {
        id: "timer-settings",
        enabled: timerEnabled,
        timer: {
          ...formData,
          enabled: timerEnabled,
          updatedAt: new Date().toISOString(),
        },
      };

      await saveTimerSettings(settings);

      toast({
        title: "Успех",
        description: "Настройки таймера сохранены",
      });

      onDataChange?.();
    } catch (error) {
      console.error("Error saving timer settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки таймера",
      });
    } finally {
      setIsSaving(false);
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
            description: "Изобр��жение загружено",
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

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка настроек таймера...</span>
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
              <Clock className="h-5 w-5 mr-2" />
              Таймер обратного отсчета
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
                <Label className="flex items-center">
                  {showPreview ? (
                    <Eye className="h-4 w-4 mr-1" />
                  ) : (
                    <EyeOff className="h-4 w-4 mr-1" />
                  )}
                  Предпросмотр
                </Label>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Включение/выключение таймера */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">
                Отображение на главной странице
              </h3>
              <p className="text-sm text-gray-600">
                Показывать таймер под кнопками навигации
              </p>
            </div>
            <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
          </div>

          {/* Настройки таймера */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название события</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Международная конференция ОИЯИ"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Краткое описание события"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="eventDate">Дата и время события</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={formData.eventDate}
                  min={getCurrentDateTime()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Изображение события</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="timer-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("timer-image-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить изображение
                    </Button>
                  </div>

                  {formData.image && (
                    <div className="mt-2 p-2 border rounded-lg">
                      <img
                        src={formData.image}
                        alt="Предварительный просмотр"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Цвет фона</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="textColor">Цвет текста</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        textColor: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Информационная панель */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium mb-2 text-yellow-800">
              💡 Информация о таймере
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Таймер отображается под кнопками навигации на главной странице
              </li>
              <li>• Автоматически обновляется каждую секунду</li>
              <li>
                • После наступления ��обытия показывает сообщение о завершении
              </li>
              <li>• Поддерживает загрузку изображений с компьютера</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Предпросмотр */}
      {showPreview && formData.title && formData.eventDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Предпросмотр таймера
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountdownTimer timer={formData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
