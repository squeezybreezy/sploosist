import React from 'react';
import { Bookmark } from '@/lib/types';
import { formatRelativeTime } from '@/lib/bookmarkUtils';
import VideoThumbnail from './VideoThumbnail';
import { AlertTriangle, Link2Off, ExternalLink, MoreHorizontal, Image, FileText } from 'lucide-react';
import { updateSplatCount } from '@/lib/bookmarkService';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: (bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const { 
    id, 
    url, 
    title, 
    description, 
    type, 
    thumbnailUrl, 
    videoThumbnailTimestamp,
    dateAdded, 
    isAlive, 
    contentChanged, 
    tags,
    splatCount = 0
  } = bookmark;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick(bookmark);
  };

  const handleSplat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateSplatCount(id);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      
      toast({
        title: "Splat!",
        description: "You've added a splat to this bookmark!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating splat count:', error);
      toast({
        title: "Error",
        description: "Failed to update splat count",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className={`bookmark-card group animate-scale-up cursor-pointer ${!isAlive ? 'opacity-70' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        {type === 'video' ? (
          <VideoThumbnail 
            url={url} 
            thumbnailUrl={thumbnailUrl} 
            videoThumbnailTimestamp={videoThumbnailTimestamp} 
          />
        ) : type === 'image' ? (
          <div className="bookmark-thumbnail">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <Image className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Image preview</p>
              </div>
            )}
          </div>
        ) : type === 'document' ? (
          <div className="bookmark-thumbnail">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Document preview</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bookmark-thumbnail">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="w-3/4 h-1/2 bg-background/50 rounded shadow-sm flex items-center justify-center">
                  {bookmark.favicon && (
                    <img 
                      src={bookmark.favicon} 
                      alt="Favicon" 
                      className="w-10 h-10 mr-3"
                    />
                  )}
                  <span className="text-sm font-medium truncate">
                    {url.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {splatCount > 0 && (
          <div className="absolute top-2 left-2 flex items-center bg-primary/90 text-white rounded-full p-1 shadow-md">
            <img 
              src="/lovable-uploads/6b7e5704-37c2-4729-8050-731e5bc6d1a1.png" 
              alt="Splat" 
              className="w-5 h-5 mr-1"
            />
            <span className="text-xs font-bold">{splatCount}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {!isAlive && (
          <div className="tag-badge bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-1">
            <Link2Off className="h-3 w-3" />
            <span>Broken link</span>
          </div>
        )}
        
        {contentChanged && (
          <div className="tag-badge bg-amber-500/10 border-amber-500/20 text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Content changed</span>
          </div>
        )}

        <h3 className="font-medium text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag.id} 
                className="tag-badge text-xs"
                style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined, borderColor: tag.color || undefined }}
              >
                <span style={{ color: tag.color }}>{tag.name}</span>
              </span>
            ))}
            {tags.length > 3 && (
              <span className="tag-badge text-xs">+{tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatRelativeTime(dateAdded)}</span>
          
          <div className="flex gap-1">
            <button 
              className="p-1 rounded-full hover:bg-primary/20 transition-colors bg-primary/10"
              onClick={handleSplat}
              aria-label="Splat this bookmark"
              title="Splat!"
            >
              <img
                src="/lovable-uploads/6b7e5704-37c2-4729-8050-731e5bc6d1a1.png"
                alt="Splat"
                className="h-4 w-4"
              />
            </button>
            
            <button 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(url, '_blank');
              }}
              aria-label="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            
            <button 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              aria-label="Edit bookmark"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
