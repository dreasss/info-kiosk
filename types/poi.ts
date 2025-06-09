export type POICategory = "building" | "attraction" | "entrance" | "food" | "entertainment"

export interface POI {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  coordinates: [number, number]
  images: string[]
  address: string
  category: POICategory
  iconUrl?: string
}

export const CATEGORIES: Record<POICategory, { name: string; icon: string; color: string }> = {
  building: {
    name: "Здание",
    icon: "building",
    color: "#3b82f6", // blue
  },
  attraction: {
    name: "Достопримечательность",
    icon: "landmark",
    color: "#8b5cf6", // purple
  },
  entrance: {
    name: "Проходная",
    icon: "door-open",
    color: "#ef4444", // red
  },
  food: {
    name: "Еда",
    icon: "utensils",
    color: "#f59e0b", // amber
  },
  entertainment: {
    name: "Развлечения",
    icon: "music",
    color: "#10b981", // emerald
  },
}
