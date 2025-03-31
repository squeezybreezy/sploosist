import { supabase } from './supabase';
import { BookmarkType } from './types';
import { getYouTubeVideoId, getVimeoVideoId, isGifUrl } from './bookmarkUtils';

// Cache to avoid unnecessary API calls
const thumbnailCache: Record<string, string> = {};

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
        thumbnailUrl = url; // Use the image URL directly
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
 * Generate a thumbnail for a video URL
 * Supports YouTube, Vimeo, and direct video links
 */
export const generateVideoThumbnail = async (url: string): Promise<string | null> => {
  // Check for YouTube videos
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  // Check if it's a GIF
  if (isGifUrl(url)) {
    return url;
  }

  // For other video URLs, use the website thumbnail
  return generateWebsiteThumbnail(url);
};

/**
 * Generate a thumbnail for a document URL
 */
export const generateDocumentThumbnail = async (url: string): Promise<string | null> => {
  // For documents, we use a generic thumbnail or screenshot the page
  return generateWebsiteThumbnail(url);
};

/**
 * Generate a thumbnail for a website URL
 * Uses a CORS-friendly approach
 */
export const generateWebsiteThumbnail = async (url: string): Promise<string | null> => {
  // Check if we have a stored thumbnail
  const storedThumbnail = await getThumbnailFromStorage(url);
  if (storedThumbnail) {
    return storedThumbnail;
  }

  // Simple option that avoids CORS issues - use a service that supports CORS
  const encodedUrl = encodeURIComponent(url);
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodedUrl}&size=128`;
};

/**
 * Get a stored thumbnail from Supabase storage
 */
export const getThumbnailFromStorage = async (url: string): Promise<string | null> => {
  // In a real implementation, you would:
  // 1. Hash the URL to create a unique filename
  // 2. Check if a file with that name exists in storage
  // 3. Return the public URL if it exists
  
  // Mock implementation
  return null;
};

/**
 * Store a thumbnail in Supabase storage
 */
export const storeThumbnail = async (url: string, thumbnailUrl: string): Promise<void> => {
  // In a real implementation, you would:
  // 1. Hash the URL to create a unique filename
  // 2. Fetch the thumbnail image
  // 3. Upload to Supabase storage
  // 4. Return the public URL
  
  // Mock implementation
  return;
};

/**
 * Delete a thumbnail from storage
 */
export const deleteThumbnail = async (url: string): Promise<void> => {
  // Remove from storage if it exists
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
