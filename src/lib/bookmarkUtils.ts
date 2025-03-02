import { Bookmark, BookmarkFilters, BookmarkType, SortOption } from './types';

// Generate a unique ID for new entities
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

// Check if URL is a video
export const isVideoUrl = (url: string): boolean => {
  const videoRegex = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i;
  
  return (
    videoRegex.test(url) ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('dailymotion.com') ||
    url.includes('twitch.tv')
  );
};

// Check if URL is a GIF
export const isGifUrl = (url: string): boolean => {
  return /\.gif(\?.*)?$/i.test(url);
};

// Extract YouTube video ID from URL
export const getYouTubeVideoId = (url: string): string | null => {
  // Handle standard YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

// Extract frames from a video file
export const extractVideoFrame = async (
  videoUrl: string, 
  timestamp: number = 5
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const video = document.createElement("video");

      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.currentTime = timestamp;
      video.muted = true;
      
      video.onloadedmetadata = () => {
        video.play().catch(err => {
          console.error("Error playing video:", err);
          reject(err);
        });
      };
      
      video.onplaying = () => {
        setTimeout(() => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
              resolve(thumbnail);
              video.pause();
            } catch (error) {
              console.error("Error generating thumbnail:", error);
              reject(error);
            }
          } else {
            reject(new Error("Could not get canvas context"));
          }
          
          // Clean up
          video.pause();
          video.src = "";
          video.load();
        }, 500); // Small delay to ensure the frame is loaded
      };
      
      video.onerror = (error) => {
        console.error("Error loading video for thumbnail generation:", error);
        reject(error);
      };
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      reject(error);
    }
  });
};

// Generate YouTube thumbnail URL from video ID
export const generateYouTubeThumbnail = (videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};

// Get a screenshot of a webpage using a screenshot service
export const getWebsiteScreenshot = (url: string): string => {
  // URL-encode the target URL
  const encodedUrl = encodeURIComponent(url);
  
  // Use the Screenshotone API with appropriate parameters
  return `https://api.screenshotone.com/take?access_key=free&url=${encodedUrl}&device_scale_factor=1&format=jpg&image_quality=85&viewport_width=1280&viewport_height=800`;
};

// Determine bookmark type from URL
export const getBookmarkTypeFromUrl = (url: string): BookmarkType => {
  const imageRegex = /\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i;
  const videoRegex = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i;
  const documentRegex = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|csv)(\?.*)?$/i;
  
  if (imageRegex.test(url)) {
    return 'image';
  } else if (videoRegex.test(url)) {
    return 'video';
  } else if (documentRegex.test(url)) {
    return 'document';
  } else if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'video';
  } else {
    return 'link';
  }
};

// Generate a thumbnail URL for a bookmark based on its URL
export const generateThumbnailUrl = async (url: string): Promise<string | null> => {
  // YouTube videos
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return generateYouTubeThumbnail(videoId);
  }
  
  // For direct image or GIF URLs, use the URL itself
  if (/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i.test(url)) {
    return url;
  }
  
  // For direct video URLs, try to extract a frame
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    try {
      return await extractVideoFrame(url, 5);
    } catch (err) {
      console.error("Could not extract video frame:", err);
    }
  }
  
  // Get website screenshot for other URLs
  return getWebsiteScreenshot(url);
};

// Filter and sort bookmarks based on filter options
export const filterBookmarks = (bookmarks: Bookmark[], filters: BookmarkFilters): Bookmark[] => {
  return bookmarks
    .filter(bookmark => {
      // Apply text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery = 
          bookmark.title.toLowerCase().includes(query) || 
          (bookmark.description || '').toLowerCase().includes(query) || 
          bookmark.url.toLowerCase().includes(query);
        
        if (!matchesQuery) return false;
      }
      
      // Apply tag filter
      if (filters.tags && filters.tags.length > 0) {
        const bookmarkTagIds = bookmark.tags.map(tag => tag.id);
        const hasAllTags = filters.tags.every(tagId => bookmarkTagIds.includes(tagId));
        if (!hasAllTags) return false;
      }
      
      // Apply type filter
      if (filters.type && bookmark.type !== filters.type) {
        return false;
      }
      
      // Apply category filter
      if (filters.category && bookmark.category?.id !== filters.category) {
        return false;
      }
      
      // Apply status filters
      if (filters.isAlive !== undefined && bookmark.isAlive !== filters.isAlive) {
        return false;
      }
      
      if (filters.contentChanged !== undefined && bookmark.contentChanged !== filters.contentChanged) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort based on selected sort option
      switch (filters.sortBy) {
        case 'dateAdded-desc':
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case 'dateAdded-asc':
          return a.dateAdded.getTime() - b.dateAdded.getTime();
        case 'lastVisited-desc':
          if (!a.lastVisited) return 1;
          if (!b.lastVisited) return -1;
          return b.lastVisited.getTime() - a.lastVisited.getTime();
        case 'lastVisited-asc':
          if (!a.lastVisited) return -1;
          if (!b.lastVisited) return 1;
          return a.lastVisited.getTime() - b.lastVisited.getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'splatCount-desc':
          return (b.splatCount || 0) - (a.splatCount || 0);
        case 'splatCount-asc':
          return (a.splatCount || 0) - (b.splatCount || 0);
        default:
          return 0;
      }
    });
};

// Extract hostname from URL for display
export const extractHostname = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};
