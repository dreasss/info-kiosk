"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Upload, Image as ImageIcon } from "lucide-react";
import type { SystemSettings } from "@/types/settings";
import { fetchSettings, updateSettings } from "@/lib/api";

interface SettingsManagerProps {
  onDataChange?: () => void;
}

export function SettingsManager({ onDataChange }: SettingsManagerProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    idleTimeout: 300000, // 5 минут
    loadingGif: "",
    organizationInfo: {
      name: "",
      fullName: "",
      logo: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSettings();
      if (data) {
        setSettings(data);
        setFormData({
          idleTimeout: data.idleTimeout,
          loadingGif: data.loadingGif,
          organizationInfo: {
            name: data.organizationInfo.name,
            fullName: data.organizationInfo.fullName,
            logo: data.organizationInfo.logo,
            description: data.organizationInfo.description,
            address: data.organizationInfo.address,
            phone: data.organizationInfo.phone,
            email: data.organizationInfo.email,
            website: data.organizationInfo.website,
          },
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить настройки",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const settingsData: SystemSettings = {
        id: settings?.id,
        idleTimeout: formData.idleTimeout,
        loadingGif: formData.loadingGif,
        organizationInfo: formData.organizationInfo,
      };

      await updateSettings(settingsData);

      toast({
        title: "Успех",
        description: "Настройки успешно сохранены",
      });

      await loadSettings();
      onDataChange?.();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, field: string) => {
    try {
      const blobUrl = URL.createObjectURL(file);

      if (field === "logo") {
        setFormData((prev) => ({
          ...prev,
          organizationInfo: {
            ...prev.organizationInfo,
            logo: blobUrl,
          },
        }));
      } else if (field === "loadingGif") {
        setFormData((prev) => ({
          ...prev,
          loadingGif: blobUrl,
        }));
      }

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

  const formatTimeout = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Загрузка настроек...</span>
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
              <Settings className="h-5 w-5 mr-2" />
              Настройки системы
            </CardTitle>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Общие настройки */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Общие настройки</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="idleTimeout">Время до заставки (минуты)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="idleTimeout"
                    type="number"
                    min="1"
                    max="60"
                    value={Math.floor(formData.idleTimeout / 60000)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        idleTimeout: parseInt(e.target.value) * 60000,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">
                    (текущее: {formatTimeout(formData.idleTimeout)})
                  </span>
                </div>
              </div>

              <div>
                <Label>GIF заставка при загрузке</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/gif,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, "loadingGif");
                        }
                      }}
                      className="hidden"
                      id="loading-gif-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("loading-gif-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить GIF
                    </Button>
                  </div>
                  <Input
                    value={formData.loadingGif}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        loadingGif: e.target.value,
                      }))
                    }
                    placeholder="или введите URL GIF файла"
                  />
                  {formData.loadingGif && (
                    <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                      <img
                        src={formData.loadingGif}
                        alt="Заставка загрузки"
                        className="max-w-32 max-h-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                      />
                      <div className="hidden text-gray-400">
                        <ImageIcon className="h-16 w-16" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Информация об организации */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Информация об организации
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orgName">Краткое название</Label>
                <Input
                  id="orgName"
                  value={formData.organizationInfo.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="ОИЯИ"
                />
              </div>

              <div>
                <Label htmlFor="orgFullName">Полное название</Label>
                <Input
                  id="orgFullName"
                  value={formData.organizationInfo.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        fullName: e.target.value,
                      },
                    }))
                  }
                  placeholder="Объединенный институт ядерных исследований"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Логотип организации</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, "logo");
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("logo-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить логотип
                    </Button>
                  </div>
                  <Input
                    value={formData.organizationInfo.logo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          logo: e.target.value,
                        },
                      }))
                    }
                    placeholder="или введите URL логотипа"
                  />
                  {formData.organizationInfo.logo && (
                    <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                      <img
                        src={formData.organizationInfo.logo}
                        alt="Логотип организации"
                        className="max-w-32 max-h-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                      />
                      <div className="hidden text-gray-400">
                        <ImageIcon className="h-16 w-16" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="orgDescription">Описание</Label>
                <Textarea
                  id="orgDescription"
                  value={formData.organizationInfo.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        description: e.target.value,
                      },
                    }))
                  }
                  placeholder="Краткое описание организации"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="orgAddress">Адрес</Label>
                <Input
                  id="orgAddress"
                  value={formData.organizationInfo.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        address: e.target.value,
                      },
                    }))
                  }
                  placeholder="ул. Жолио-Кюри, 6, Дубна"
                />
              </div>

              <div>
                <Label htmlFor="orgPhone">Телефон</Label>
                <Input
                  id="orgPhone"
                  value={formData.organizationInfo.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+7 (496) 216-40-40"
                />
              </div>

              <div>
                <Label htmlFor="orgEmail">Email</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  value={formData.organizationInfo.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        email: e.target.value,
                      },
                    }))
                  }
                  placeholder="info@jinr.ru"
                />
              </div>

              <div>
                <Label htmlFor="orgWebsite">Веб-сайт</Label>
                <Input
                  id="orgWebsite"
                  value={formData.organizationInfo.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationInfo: {
                        ...prev.organizationInfo,
                        website: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://www.jinr.ru"
                />
              </div>
            </div>
          </div>

          {/* Информационная панель */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Информация о настройках</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Время до заставки определяет, когда активируется режим
                ожидания
              </li>
              <li>• GIF заставка отображается во время загрузки системы</li>
              <li>
                • Информация об организации используется в интерфейсе системы
              </li>
              <li>• Логотип отображается в шапке приложения</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
