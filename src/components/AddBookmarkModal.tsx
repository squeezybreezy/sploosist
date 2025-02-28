
import React, { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon } from 'lucide-react';
import TagsInput from './TagsInput';
import { Tag, Category, Bookmark } from '@/lib/types';
import { generateUniqueId, getBookmarkTypeFromUrl, isVideoUrl, getYouTubeVideoId, generateYouTubeThumbnail } from '@/lib/bookmarkUtils';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (bookmark: Bookmark) => void;
  editBookmark?: Bookmark;
  availableTags: Tag[];
  availableCategories: Category[];
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onAddBookmark,
  editBookmark,
  availableTags,
  availableCategories
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  
  // Reset form when modal opens/closes or edit bookmark changes
  useEffect(() => {
    if (isOpen) {
      if (editBookmark) {
        setTitle(editBookmark.title);
        setUrl(editBookmark.url);
        setDescription(editBookmark.description || '');
        setSelectedTags(editBookmark.tags);
        setSelectedCategory(editBookmark.category?.id || '');
        setThumbnailUrl(editBookmark.thumbnailUrl || '');
      } else {
        setTitle('');
        setUrl('');
        setDescription('');
        setSelectedTags([]);
        setSelectedCategory('');
        setThumbnailUrl('');
      }
      setIsUrlValid(true);
      setIsLoading(false);
    }
  }, [isOpen, editBookmark]);

  // When URL changes, validate it and try to fetch metadata if valid
  useEffect(() => {
    const validateUrl = () => {
      if (!url) {
        setIsUrlValid(true);
        return;
      }
      
      try {
        new URL(url);
        setIsUrlValid(true);
        
        // For YouTube videos, extract a thumbnail automatically
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
          setThumbnailUrl(generateYouTubeThumbnail(videoId));
        }
      } catch (e) {
        setIsUrlValid(false);
      }
    };
    
    validateUrl();
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !isUrlValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Build the bookmark object
      const newBookmark: Bookmark = {
        id: editBookmark?.id || generateUniqueId(),
        url,
        title: title || url,
        description: description || undefined,
        type: getBookmarkTypeFromUrl(url),
        thumbnailUrl: thumbnailUrl || undefined,
        videoThumbnailTimestamp: isVideoUrl(url) ? 60 : undefined,
        dateAdded: editBookmark?.dateAdded || new Date(),
        lastVisited: editBookmark?.lastVisited,
        lastChecked: editBookmark?.lastChecked,
        isAlive: editBookmark?.isAlive !== undefined ? editBookmark.isAlive : true,
        contentChanged: editBookmark?.contentChanged,
        tags: selectedTags,
        category: selectedCategory ? availableCategories.find(c => c.id === selectedCategory) : undefined,
      };
      
      onAddBookmark(newBookmark);
      onClose();
    } catch (error) {
      console.error('Error adding bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-md w-full bg-card rounded-lg shadow-lg animate-scale-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            className="p-1 rounded-full hover:bg-secondary transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL input */}
          <div className="space-y-1">
            <label htmlFor="url" className="text-sm font-medium">
              URL <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-md ${!isUrlValid ? 'border-destructive' : ''}`}
                placeholder="https://example.com"
                required
              />
            </div>
            {!isUrlValid && (
              <p className="text-xs text-destructive">Please enter a valid URL</p>
            )}
          </div>
          
          {/* Title input */}
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Title of the bookmark"
            />
          </div>
          
          {/* Description input */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              placeholder="Add a description..."
            />
          </div>
          
          {/* Thumbnail URL input */}
          <div className="space-y-1">
            <label htmlFor="thumbnailUrl" className="text-sm font-medium">
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="URL for the thumbnail image"
            />
            {thumbnailUrl && (
              <div className="mt-2 h-24 w-auto overflow-hidden rounded border">
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="h-full w-full object-cover"
                  onError={() => setThumbnailUrl('')}
                />
              </div>
            )}
          </div>
          
          {/* Tags input */}
          <div className="space-y-1">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <TagsInput
              tags={selectedTags}
              availableTags={availableTags}
              onTagsChange={setSelectedTags}
              placeholder="Add tags..."
            />
          </div>
          
          {/* Category select */}
          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select a category</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors mr-2"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
              disabled={!url || !isUrlValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{editBookmark ? 'Update' : 'Add'} Bookmark</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkModal;
