
import { Bookmark, BookmarkFilters, Tag, Category, BookmarkType } from './types';

// Mock data for initial bookmarks
export const generateMockBookmarks = (): Bookmark[] => {
  const tags: Tag[] = [
    { id: '1', name: 'Technology', color: '#3b82f6' },
    { id: '2', name: 'Design', color: '#ec4899' },
    { id: '3', name: 'Development', color: '#10b981' },
    { id: '4', name: 'Tutorial', color: '#f59e0b' },
    { id: '5', name: 'News', color: '#6366f1' },
  ];

  const categories: Category[] = [
    { id: '1', name: 'Work', icon: 'briefcase' },
    { id: '2', name: 'Personal', icon: 'user' },
    { id: '3', name: 'Learning', icon: 'book-open' },
    { id: '4', name: 'Entertainment', icon: 'film' },
  ];

  return [
    {
      id: '1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up - Rick Astley',
      description: 'The classic music video that became an internet sensation',
      type: 'video',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoThumbnailTimestamp: 60,
      dateAdded: new Date('2023-01-15'),
      lastVisited: new Date('2023-03-20'),
      lastChecked: new Date('2023-04-01'),
      isAlive: true,
      tags: [tags[3], tags[4]],
      category: categories[3],
      favicon: 'https://www.youtube.com/favicon.ico',
    },
    {
      id: '2',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      title: 'JavaScript | MDN Web Docs',
      description: 'JavaScript (JS) is a lightweight interpreted programming language with first-class functions.',
      type: 'link',
      thumbnailUrl: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      dateAdded: new Date('2023-02-20'),
      lastVisited: new Date('2023-04-15'),
      lastChecked: new Date('2023-04-18'),
      isAlive: true,
      tags: [tags[0], tags[2]],
      category: categories[2],
      favicon: 'https://developer.mozilla.org/favicon.ico',
    },
    {
      id: '3',
      url: 'https://www.figma.com/file/example123/Design-System',
      title: 'Company Design System - Figma',
      description: 'Master design system with all UI components and patterns',
      type: 'link',
      thumbnailUrl: 'https://cdn.sanity.io/images/599r6htc/localized/7d247a9d2b8f1e3d54268610639fa7d456638451-1920x1080.png?rect=0,0,1920,1080&w=670&h=377&q=75&fit=max&auto=format',
      dateAdded: new Date('2023-03-10'),
      lastVisited: new Date('2023-04-10'),
      lastChecked: new Date('2023-04-11'),
      isAlive: true,
      tags: [tags[1], tags[4]],
      category: categories[0],
      favicon: 'https://www.figma.com/favicon.ico',
    },
    {
      id: '4',
      url: 'https://www.youtube.com/watch?v=C0DPdy98e4c',
      title: 'Web Development in 2023 - A Practical Guide',
      description: 'Learn the latest trends and technologies in web development',
      type: 'video',
      thumbnailUrl: 'https://img.youtube.com/vi/C0DPdy98e4c/maxresdefault.jpg',
      videoThumbnailTimestamp: 120,
      dateAdded: new Date('2023-03-25'),
      lastVisited: new Date('2023-04-01'),
      lastChecked: new Date('2023-04-05'),
      isAlive: true,
      tags: [tags[0], tags[2], tags[3]],
      category: categories[2],
      favicon: 'https://www.youtube.com/favicon.ico',
    },
    {
      id: '5',
      url: 'https://broken-link-example.com',
      title: 'Broken Link Example',
      description: 'This link is no longer working',
      type: 'link',
      dateAdded: new Date('2022-12-10'),
      lastChecked: new Date('2023-04-20'),
      isAlive: false,
      tags: [tags[0]],
      category: categories[1],
    },
    {
      id: '6',
      url: 'https://tailwindcss.com',
      title: 'Tailwind CSS - Rapidly build modern websites without ever leaving your HTML',
      description: 'A utility-first CSS framework for rapidly building custom user interfaces',
      type: 'link',
      thumbnailUrl: 'https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg',
      dateAdded: new Date('2023-01-05'),
      lastVisited: new Date('2023-04-18'),
      lastChecked: new Date('2023-04-19'),
      isAlive: true,
      contentChanged: true,
      tags: [tags[1], tags[2]],
      category: categories[2],
      favicon: 'https://tailwindcss.com/favicon.ico',
    },
  ];
};

// Filter bookmarks based on filters
export const filterBookmarks = (bookmarks: Bookmark[], filters: BookmarkFilters): Bookmark[] => {
  return bookmarks.filter((bookmark) => {
    // Text search
    if (filters.query && !bookmarkMatchesQuery(bookmark, filters.query)) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0 && !bookmarkHasAnyTag(bookmark, filters.tags)) {
      return false;
    }

    // Type filter
    if (filters.type && bookmark.type !== filters.type) {
      return false;
    }

    // Category filter
    if (filters.category && bookmark.category?.id !== filters.category) {
      return false;
    }

    // Status filters
    if (filters.isAlive !== undefined && bookmark.isAlive !== filters.isAlive) {
      return false;
    }

    if (filters.contentChanged !== undefined && bookmark.contentChanged !== filters.contentChanged) {
      return false;
    }

    return true;
  }).sort((a, b) => sortBookmarks(a, b, filters.sortBy));
};

// Helper functions for filtering
const bookmarkMatchesQuery = (bookmark: Bookmark, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return (
    bookmark.title.toLowerCase().includes(lowerQuery) ||
    (bookmark.description?.toLowerCase().includes(lowerQuery) || false) ||
    bookmark.url.toLowerCase().includes(lowerQuery) ||
    bookmark.tags.some((tag) => tag.name.toLowerCase().includes(lowerQuery))
  );
};

const bookmarkHasAnyTag = (bookmark: Bookmark, tagIds: string[]): boolean => {
  return bookmark.tags.some((tag) => tagIds.includes(tag.id));
};

// Sort bookmarks based on sort option
const sortBookmarks = (a: Bookmark, b: Bookmark, sortBy: string): number => {
  const [field, order] = sortBy.split('-');
  const multiplier = order === 'asc' ? 1 : -1;

  switch (field) {
    case 'dateAdded':
      return multiplier * (a.dateAdded.getTime() - b.dateAdded.getTime());
    case 'lastVisited':
      if (!a.lastVisited) return multiplier;
      if (!b.lastVisited) return -multiplier;
      return multiplier * (a.lastVisited.getTime() - b.lastVisited.getTime());
    case 'title':
      return multiplier * a.title.localeCompare(b.title);
    default:
      return 0;
  }
};

// Function to extract video ID from YouTube URL
export const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Function to generate a thumbnail URL for a YouTube video
export const generateYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Function to detect if a URL is a video
export const isVideoUrl = (url: string): boolean => {
  // Simple check for common video platforms
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('dailymotion.com') ||
    url.includes('twitch.tv')
  );
};

// Get bookmark type from URL
export const getBookmarkTypeFromUrl = (url: string): BookmarkType => {
  if (isVideoUrl(url)) {
    return 'video';
  }
  
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  
  if (extension && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
    return 'document';
  }
  
  return 'link';
};

// Format date to relative time (e.g., "2 days ago")
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

// Helper to generate unique ID
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
