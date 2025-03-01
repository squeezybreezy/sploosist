
import React, { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon } from 'lucide-react';
import TagsInput from './TagsInput';
import { Tag, Category, Bookmark } from '@/lib/types';
import { 
  generateUniqueId, 
  getBookmarkTypeFromUrl, 
  isVideoUrl, 
  getYouTubeVideoId, 
  generateYouTubeThumbnail,
  getWebsiteScreenshot
} from '@/lib/bookmarkUtils';

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
  const [hasManuallySetThumbnail, setHasManuallySetThumbnail] = useState(false);
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
  
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
        setHasManuallySetThumbnail(!!editBookmark.thumbnailUrl);
      } else {
        setTitle('');
        setUrl('');
        setDescription('');
        setSelectedTags([]);
        setSelectedCategory('');
        setThumbnailUrl('');
        setHasManuallySetThumbnail(false);
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
        
        // For YouTube videos, extract a thumbnail automatically only if user hasn't set one manually
        if (!hasManuallySetThumbnail) {
          const videoId = getYouTubeVideoId(url);
          if (videoId) {
            setThumbnailUrl(generateYouTubeThumbnail(videoId));
          } else {
            // For non-YouTube URLs and if no thumbnail is set, generate a screenshot
            setIsGeneratingScreenshot(true);
            // We're using a timeout to avoid blocking the UI and to simulate the API call
            // In a real scenario, you'd make an actual API call here
            setTimeout(() => {
              setThumbnailUrl(getWebsiteScreenshot(url));
              setIsGeneratingScreenshot(false);
            }, 500);
          }
        }
      } catch (e) {
        setIsUrlValid(false);
      }
    };
    
    validateUrl();
  }, [url, hasManuallySetThumbnail]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(e.target.value);
    setHasManuallySetThumbnail(true);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-md w-full bg-card rounded-lg shadow-lg animate-scale-up">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">
            {editBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            className="p-1 rounded-full hover:bg-secondary transition-colors text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL input */}
          <div className="space-y-1">
            <label htmlFor="url" className="text-sm font-medium text-white">
              URL <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-md text-white bg-secondary ${!isUrlValid ? 'border-destructive' : 'border-border'}`}
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
            <label htmlFor="title" className="text-sm font-medium text-white">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-white bg-secondary"
              placeholder="Title of the bookmark"
            />
          </div>
          
          {/* Description input */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-white">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md min-h-[80px] text-white bg-secondary"
              placeholder="Add a description..."
            />
          </div>
          
          {/* Thumbnail URL input */}
          <div className="space-y-1">
            <label htmlFor="thumbnailUrl" className="text-sm font-medium text-white">
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              type="text"
              value={thumbnailUrl}
              onChange={handleThumbnailChange}
              className="w-full px-3 py-2 border border-border rounded-md text-white bg-secondary"
              placeholder="URL for the thumbnail image"
            />
            {isGeneratingScreenshot && (
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generating screenshot...
              </div>
            )}
            {thumbnailUrl && (
              <div className="mt-2 h-24 w-auto overflow-hidden rounded border border-border">
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="h-full w-full object-cover"
                  onError={() => {
                    if (!hasManuallySetThumbnail) {
                      setThumbnailUrl('');
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Tags input */}
          <div className="space-y-1">
            <label htmlFor="tags" className="text-sm font-medium text-white">
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
            <label htmlFor="category" className="text-sm font-medium text-white">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-secondary text-white"
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
              className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors mr-2 text-white"
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
