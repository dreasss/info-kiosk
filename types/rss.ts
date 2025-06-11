export interface RssFeed {
  id: string;
  name: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RssItem {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  link?: string;
  pubDate: string;
  content?: string;
}
