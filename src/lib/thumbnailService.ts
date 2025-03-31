import { supabase } from './supabase';
import { BookmarkType } from './types';
import { getYouTubeVideoId, getVimeoVideoId, isGifUrl } from './bookmarkUtils';

// Cache to avoid unnecessary API calls
const thumbnailCache: Record<string, string> = {};

// Your API token here
const SCREENSHOT_API_TOKEN = "T9CY3J4-PZGMAGC-JAVFRRR-BA4PM3S";

/**
 * Generate a thumbnail for a bookmark based on its URL and type
 * @param url The URL to generate a thumbnail for
 * @param type The type of bookmark (video, image, document, link)
 * @returns A promise that resolves to the thumbnail URL
 */
export const generateThumbnail = async (url: string, type: BookmarkType): Promise<string | null> => {
  // Check cache first
  if (thumbnailCache[url]) {
    return thumbnailCache[url];
  }

  try {
    let thumbnailUrl: string | null = null;

    // Handle different content types
    switch (type) {
      case 'video':
        thumbnailUrl = await generateVideoThumbnail(url);
        break;
      case 'image':
        // For images, use a reliable image proxy that handles CORS
        thumbnailUrl = createProxiedImageUrl(url);
        break;
      case 'document':
        thumbnailUrl = await generateDocumentThumbnail(url);
        break;
      case 'link':
      default:
        thumbnailUrl = await generateWebsiteThumbnail(url);
        break;
    }

    // Cache the result
    if (thumbnailUrl) {
      thumbnailCache[url] = thumbnailUrl;
    }

    return thumbnailUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

/**
 * Create a proxied image URL to avoid CORS issues
 */
const createProxiedImageUrl = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  // Images.weserv.nl is a very reliable image proxy service
  return `https://images.weserv.nl/?url=${encodedUrl}&w=640&h=480&fit=cover&output=jpg`;
};

/**
 * Generate a thumbnail for a video URL
 * Supports YouTube, Vimeo, and direct video links
 */
export const generateVideoThumbnail = async (url: string): Promise<string | null> => {
  // Check for YouTube videos (most reliable)
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  // Check if it's a GIF
  if (isGifUrl(url)) {
    return createProxiedImageUrl(url);
  }

  // For other video URLs, use website screenshot
  return generateWebsiteThumbnail(url);
};

/**
 * Generate a thumbnail for a document URL
 */
export const generateDocumentThumbnail = async (url: string): Promise<string | null> => {
  // For documents, use website screenshot
  return generateWebsiteThumbnail(url);
};

/**
 * Generate a thumbnail for a website URL
 * Uses a reliable screenshot service that handles CORS
 */
export const generateWebsiteThumbnail = async (url: string): Promise<string | null> => {
  // Check if we have a stored thumbnail
  const storedThumbnail = await getThumbnailFromStorage(url);
  if (storedThumbnail) {
    return storedThumbnail;
  }

  // URL-encode the target URL
  const encodedUrl = encodeURIComponent(url);
  
  // Use a reliable screenshot service or API that supports CORS
  return `https://shot.screenshotapi.net/screenshot?token=${SCREENSHOT_API_TOKEN}&url=${encodedUrl}&width=800&height=600&output=image&file_type=png&wait_for_event=load`;
};

/**
 * Get a stored thumbnail from Supabase storage
 */
export const getThumbnailFromStorage = async (url: string): Promise<string | null> => {
  // Mock implementation
  return null;
};

/**
 * Store a thumbnail in Supabase storage
 */
export const storeThumbnail = async (url: string, thumbnailUrl: string): Promise<void> => {
  // Mock implementation
  return;
};

/**
 * Delete a thumbnail from storage
 */
export const deleteThumbnail = async (url: string): Promise<void> => {
  // Mock implementation
  return;
};

/**
 * Regenerate a thumbnail for a URL
 */
export const regenerateThumbnail = async (url: string, type: BookmarkType): Promise<string | null> => {
  // Clear from cache
  delete thumbnailCache[url];
  
  // Delete from storage
  await deleteThumbnail(url);
  
  // Generate new thumbnail
  return generateThumbnail(url, type);
};
