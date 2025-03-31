import { supabase } from './supabase';
import { BookmarkType } from './types';
import { getYouTubeVideoId, getVimeoVideoId, isGifUrl } from './bookmarkUtils';

// Cache to avoid unnecessary API calls
const thumbnailCache: Record<string, string> = {};

// Your API token here 
const SCREENSHOT_API_TOKEN = "T9CY3J4-PZGMAGC-JAVFRRR-BA4PM3S";

/**
 * Generate a thumbnail for a bookmark based on its URL and type
 */
export const generateThumbnail = async (url: string, type: BookmarkType): Promise<string | null> => {
  // Check cache first
  if (thumbnailCache[url]) {
    return thumbnailCache[url];
  }

  try {
    // Special handling for popular sites first (like raindrop.io does)
    // YouTube videos
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      const thumbUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      thumbnailCache[url] = thumbUrl;
      return thumbUrl;
    }
    
    // Vimeo videos (if available via API)
    const vimeoId = getVimeoVideoId(url);
    if (vimeoId) {
      try {
        // We'll use a proxy since Vimeo API might have CORS issues
        const thumbUrl = `https://vumbnail.com/${vimeoId}.jpg`;
        thumbnailCache[url] = thumbUrl;
        return thumbUrl;
      } catch (error) {
        console.error('Error fetching Vimeo thumbnail:', error);
      }
    }
    
    // Twitter/X posts (typical special handling)
    if (url.match(/twitter\.com|x\.com/i)) {
      return generateHighQualityScreenshot(url);
    }
    
    // Handle by content type
    switch (type) {
      case 'video':
        return generateHighQualityScreenshot(url);
      
      case 'image':
        return createOptimizedImageProxy(url);
        
      case 'document':
        return generateHighQualityScreenshot(url);
        
      case 'link':
      default:
        return generateHighQualityScreenshot(url);
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

/**
 * Create an optimized image proxy URL for direct images
 */
const createOptimizedImageProxy = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  // Images.weserv.nl is highly reliable and supports optimization
  return `https://images.weserv.nl/?url=${encodedUrl}&w=800&h=600&fit=cover&we&output=jpg&q=85`;
};

/**
 * Generate a high-quality screenshot like raindrop.io
 */
const generateHighQualityScreenshot = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  
  // Preferred option: screenshotapi.net (most reliable)
  return `https://shot.screenshotapi.net/screenshot?token=${SCREENSHOT_API_TOKEN}&url=${encodedUrl}&width=1200&height=800&output=image&file_type=png&wait_for_event=load&device_scale_factor=1&full_page=false&fresh=true&ttl=2592000`;
  
  // You could also try these alternatives:
  // return `https://image.thum.io/get/width/1200/crop/800/viewportWidth/1200/png/${encodedUrl}`;
  // return `https://api.urlbox.io/v1/render?url=${encodedUrl}&width=1200&height=800&format=png`;
};

/**
 * Regenerate a thumbnail for a URL
 */
export const regenerateThumbnail = async (url: string, type: BookmarkType): Promise<string | null> => {
  // Clear from cache
  delete thumbnailCache[url];
  
  // Generate new thumbnail
  return generateThumbnail(url, type);
};

// Other utility functions...
export const getThumbnailFromStorage = async (url: string): Promise<string | null> => {
  return null; // Mock implementation
};

export const storeThumbnail = async (url: string, thumbnailUrl: string): Promise<void> => {
  return; // Mock implementation
};

export const deleteThumbnail = async (url: string): Promise<void> => {
  return; // Mock implementation
};
