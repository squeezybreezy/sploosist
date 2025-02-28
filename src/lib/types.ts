
export type BookmarkType = 'link' | 'video' | 'image' | 'document';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: BookmarkType;
  thumbnailUrl?: string;
  videoThumbnailTimestamp?: number;
  dateAdded: Date;
  lastVisited?: Date;
  lastChecked?: Date;
  isAlive?: boolean;
  contentChanged?: boolean;
  tags: Tag[];
  category?: Category;
  favicon?: string;
}

export type SortOption = 
  | 'dateAdded-desc' 
  | 'dateAdded-asc' 
  | 'lastVisited-desc' 
  | 'lastVisited-asc' 
  | 'title-asc' 
  | 'title-desc';

export interface BookmarkFilters {
  query: string;
  tags: string[];
  type?: BookmarkType;
  category?: string;
  isAlive?: boolean;
  contentChanged?: boolean;
  sortBy: SortOption;
}
