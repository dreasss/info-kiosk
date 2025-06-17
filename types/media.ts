export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  category: "photo" | "video";
  date: string;
  albumId?: string;
  fileSize?: number;
  duration?: number; // для видео в секундах
  dimensions?: {
    width: number;
    height: number;
  };
  tags?: string[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string; // ID медиафайла, который будет обложкой
  type: "photo" | "video" | "mixed";
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}
