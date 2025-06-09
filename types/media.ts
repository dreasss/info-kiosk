export interface MediaItem {
  id: string
  title: string
  description?: string
  type: "image" | "video"
  url: string
  thumbnail?: string
  category: "photo" | "video"
  date: string
}
