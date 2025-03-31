import { Bookmark, BookmarkFilters, BookmarkType, SortOption } from './types';
import { generateThumbnail } from './thumbnailService';

// Generate a unique ID for new entities
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Extract YouTube video ID from various URL formats
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Try multiple YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, // Standard and embed URLs
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/i, // YouTube Shorts
    /youtube\.com\/live\/([^"&?\/\s]{11})/i    // YouTube Live
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Extract Vimeo video ID from URL
export const getVimeoVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Try multiple Vimeo URL formats
  const patterns = [
    /vimeo\.com\/([0-9]+)/i,                    // Standard URL
    /vimeo\.com\/channels\/.*\/([0-9]+)/i,      // Channel URL
    /vimeo\.com\/groups\/.*\/videos\/([0-9]+)/i // Group URL
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Check if URL is a GIF
export const isGifUrl = (url: string): boolean => {
  if (!url) return false;
  return /\.gif(\?.*)?$/i.test(url);
};

// Get a YouTube thumbnail URL from a video ID
export const generateYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Get a Vimeo thumbnail URL from a video ID (requires API call in thumbnailService)
export const getVimeoThumbnail = async (videoId: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
    const data = await response.json();
    return data[0]?.thumbnail_large || null;
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error);
    return null;
  }
};

// Get a website screenshot using a screenshot service
export const getWebsiteScreenshot = (url: string): string => {
  // URL-encode the target URL
  const encodedUrl = encodeURIComponent(url);
  
  // Use the Screenshotone API with appropriate parameters
  return `https://api.screenshotone.com/take?access_key=free&url=${encodedUrl}&device_scale_factor=1&format=jpg&image_quality=85&viewport_width=1280&viewport_height=800`;
};

// Get a website favicon using multiple sources for fallback
export const getWebsiteFavicon = (url: string): string => {
  if (!url) return '';
  
  try {
    // Extract the domain from the URL
    const domain = new URL(url).hostname;
    
    // Use Google's favicon service (most reliable)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    return '';
  }
};

// Determine bookmark type from URL
export const getBookmarkTypeFromUrl = (url: string): BookmarkType => {
  if (!url) return 'link';
  
  // Check for video URLs
  if (isVideoUrl(url)) {
    return 'video';
  }
  
  // Check for image URLs
  if (isImageUrl(url)) {
    return 'image';
  }
  
  // Check for document URLs
  if (isDocumentUrl(url)) {
    return 'document';
  }
  
  // Default to link
  return 'link';
};

// Check if URL is a video
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common video hosting platforms
  if (getYouTubeVideoId(url) || getVimeoVideoId(url)) {
    return true;
  }
  
  // Check for direct video file extensions
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url);
};

// Check if URL is an image
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for image file extensions
  return /\.(jpe?g|png|gif|bmp|webp|svg|ico)(\?.*)?$/i.test(url);
};

// Check if URL is a document
export const isDocumentUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for document file extensions
  return /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|csv|odt|ods|odp)(\?.*)?$/i.test(url);
};

// Format a date as a relative time string (e.g., "2 days ago")
export const formatRelativeTime = (date: Date): string => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
};

// Filter bookmarks based on search criteria
export const filterBookmarks = (bookmarks: Bookmark[], filters: BookmarkFilters): Bookmark[] => {
  if (!bookmarks) return [];
  
  return bookmarks.filter(bookmark => {
    // Filter by search query
    if (filters.query && !matchesSearchQuery(bookmark, filters.query)) {
      return false;
    }
    
    // Filter by tags
    if (filters.tags.length > 0 && !hasAnyTag(bookmark, filters.tags)) {
      return false;
    }
    
    // Filter by category
    if (filters.category && bookmark.category?.id !== filters.category) {
      return false;
    }
    
    // Filter by type
    if (filters.type && bookmark.type !== filters.type) {
      return false;
    }
    
    // Filter by alive status
    if (filters.isAlive !== undefined && bookmark.isAlive !== filters.isAlive) {
      return false;
    }
    
    // Filter by content changed status
    if (filters.contentChanged !== undefined && bookmark.contentChanged !== filters.contentChanged) {
      return false;
    }
    
    return true;
  });
};

// Sort bookmarks based on sort option
export const sortBookmarks = (bookmarks: Bookmark[], sortBy: SortOption): Bookmark[] => {
  if (!bookmarks) return [];
  
  const [field, direction] = sortBy.split('-') as [keyof Bookmark, 'asc' | 'desc'];
  
  return [...bookmarks].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle nested fields (e.g., category.name)
    if (field === 'category') {
      valueA = a.category?.name || '';
      valueB = b.category?.name || '';
    }
    
    // Handle date comparison
    if (field === 'dateAdded' || field === 'lastVisited' || field === 'lastChecked') {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle number comparison
    if (direction === 'asc') {
      return (valueA as number) - (valueB as number);
    } else {
      return (valueB as number) - (valueA as number);
    }
  });
};

// Helper function: Check if bookmark matches search query
const matchesSearchQuery = (bookmark: Bookmark, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  
  return (
    bookmark.title.toLowerCase().includes(lowerQuery) ||
    bookmark.url.toLowerCase().includes(lowerQuery) ||
    (bookmark.description && bookmark.description.toLowerCase().includes(lowerQuery)) ||
    bookmark.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)) ||
    (bookmark.category && bookmark.category.name.toLowerCase().includes(lowerQuery))
  );
};

// Helper function: Check if bookmark has any of the specified tags
const hasAnyTag = (bookmark: Bookmark, tagIds: string[]): boolean => {
  return bookmark.tags.some(tag => tagIds.includes(tag.id));
};
