"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { POI } from "@/types/poi"
import { MapPin, Plus, Save, Trash } from "lucide-react"

// This is a simple admin interface for adding POIs
// In a real application, this would connect to a backend API and database

export default function AdminPage() {
  const [pois, setPois] = useState<POI[]>([])
  const [currentPoi, setCurrentPoi] = useState<Partial<POI>>({
    id: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    coordinates: [56.7417, 37.189],
    images: [],
    address: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentPoi((prev) => ({ ...prev, [name]: value }))
  }

  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number.parseFloat(e.target.value)
    setCurrentPoi((prev) => {
      const newCoordinates = [...(prev.coordinates || [56.7417, 37.189])]
      newCoordinates[index] = value
      return { ...prev, coordinates: newCoordinates as [number, number] }
    })
  }

  const handleAddImage = () => {
    setCurrentPoi((prev) => ({
      ...prev,
      images: [...(prev.images || []), `/images/placeholder-${(prev.images?.length || 0) + 1}.jpg`],
    }))
  }

  const handleRemoveImage = (index: number) => {
    setCurrentPoi((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    if (!currentPoi.name || !currentPoi.coordinates) {
      alert("Название и координаты обязательны!")
      return
    }

    const newPoi: POI = {
      id: currentPoi.id || Date.now().toString(),
      name: currentPoi.name,
      shortDescription: currentPoi.shortDescription || "",
      fullDescription: currentPoi.fullDescription || "",
      coordinates: currentPoi.coordinates as [number, number],
      images: currentPoi.images || [],
      address: currentPoi.address || "",
    }

    setPois((prev) => [...prev, newPoi])

    // Reset form
    setCurrentPoi({
      id: "",
      name: "",
      shortDescription: "",
      fullDescription: "",
      coordinates: [56.7417, 37.189],
      images: [],
      address: "",
    })

    // In a real application, this would save to a database via API
    alert("Объект сохранен! (В реальном приложении данные будут сохранены в базу данных)")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Добавить новый объект</CardTitle>
            <CardDescription>Заполните информацию о новом объекте на карте</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={currentPoi.name}
                onChange={handleInputChange}
                placeholder="Название объекта"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Краткое описание</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                value={currentPoi.shortDescription}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Полное описание объекта"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Координаты</Label>
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
                onChange={handleInputChange}
                placeholder="Полный адрес объекта"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Изображения</Label>
                <Button variant="outline" size="sm" onClick={handleAddImage}>
                  <Plus className="h-4 w-4 mr-1" /> Добавить
                </Button>
              </div>

              {currentPoi.images && currentPoi.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {currentPoi.images.map((image, index) => (
                    <div key={index} className="relative border rounded p-2">
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
                <p className="text-sm text-muted-foreground">Нет добавленных изображений</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Сохранить объект
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Добавленные объекты</CardTitle>
            <CardDescription>Список объектов, добавленных в текущей сессии</CardDescription>
          </CardHeader>
          <CardContent>
            {pois.length > 0 ? (
              <div className="space-y-4">
                {pois.map((poi) => (
                  <div key={poi.id} className="border rounded p-4">
                    <h3 className="font-bold">{poi.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {poi.coordinates[0].toFixed(4)}, {poi.coordinates[1].toFixed(4)}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{poi.shortDescription}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Нет добавленных объектов</p>
            )}
          </CardContent>
        </Card>

        {/* Раздел управления медиафайлами */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Управление медиафайлами</CardTitle>
            <CardDescription>Загрузка фото и видео для галереи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mediaTitle">Название</Label>
              <Input id="mediaTitle" placeholder="Название медиафайла" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaDescription">Описание</Label>
              <Textarea id="mediaDescription" placeholder="Описание медиафайла" rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Тип медиафайла</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="mediaType" value="photo" defaultChecked />
                  <span>Фото</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="mediaType" value="video" />
                  <span>Видео</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaFile">Файл</Label>
              <Input id="mediaFile" type="file" accept="image/*,video/*" />
            </div>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Добавить медиафайл
            </Button>
          </CardContent>
        </Card>

        {/* Раздел управления иконками маркеров */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Пользовательские иконки маркеров</CardTitle>
            <CardDescription>Загрузка собственных иконок для маркеров на карте</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iconName">Название иконки</Label>
              <Input id="iconName" placeholder="Например: Лаборатория" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconFile">Файл иконки (PNG, SVG, 32x32px)</Label>
              <Input id="iconFile" type="file" accept="image/png,image/svg+xml" />
            </div>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Загрузить иконку
            </Button>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Загруженные иконки:</h4>
              <div className="grid grid-cols-4 gap-2">
                {/* Здесь будут отображаться загруженные иконки */}
                <div className="border rounded p-2 text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
                  <span className="text-xs">Пример</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
