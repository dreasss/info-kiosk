export interface EventTimer {
  id?: string;
  title: string;
  description: string;
  eventDate: string; // ISO date string
  image?: string; // base64 or URL
  enabled: boolean;
  backgroundColor?: string;
  textColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimerSettings {
  id?: string;
  enabled: boolean;
  timer?: EventTimer;
}
