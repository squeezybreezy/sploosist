
import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { getYouTubeVideoId, isGifUrl } from '@/lib/bookmarkUtils';

interface VideoThumbnailProps {
  url: string;
  thumbnailUrl?: string;
  videoThumbnailTimestamp?: number;
  onError?: () => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  url,
  thumbnailUrl,
  videoThumbnailTimestamp = 60,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoId = getYouTubeVideoId(url);
  const isGif = isGifUrl(url) || isGifUrl(thumbnailUrl || '');
  
  useEffect(() => {
    if (posterRef.current) {
      const img = posterRef.current;
      if (img.complete) {
        setIsLoading(false);
      } else {
        img.onload = () => setIsLoading(false);
        img.onerror = () => {
          setIsLoading(false);
          setHasError(true);
          if (onError) onError();
        };
      }
    }
  }, [thumbnailUrl, onError]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = videoThumbnailTimestamp;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Render a GIF thumbnail
  if (isGif) {
    return (
      <div className="bookmark-thumbnail relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">GIF unavailable</p>
          </div>
        ) : (
          <img
            ref={posterRef}
            src={thumbnailUrl || url}
            alt="GIF thumbnail"
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          />
        )}
        
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          GIF
        </div>
      </div>
    );
  }

  // Render a YouTube embed thumbnail for YouTube videos
  if (videoId) {
    return (
      <div 
        className="bookmark-thumbnail group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Thumbnail unavailable</p>
          </div>
        ) : (
          <>
            <img
              ref={posterRef}
              src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
            
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                <Play className="h-6 w-6 text-primary fill-primary" />
              </button>
            </div>
            
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              YouTube
            </div>
          </>
        )}
      </div>
    );
  }

  // Render a generic video thumbnail for other video URLs
  return (
    <div 
      className="bookmark-thumbnail group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {thumbnailUrl ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
          
          <img
            ref={posterRef}
            src={thumbnailUrl}
            alt="Video thumbnail"
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          />
          
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <Play className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Video preview</p>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;
