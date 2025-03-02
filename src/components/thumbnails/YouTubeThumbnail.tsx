
import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertTriangle, Loader } from 'lucide-react';

interface YouTubeThumbnailProps {
  videoId: string;
  thumbnailUrl?: string;
  videoThumbnailTimestamp: number;
  onError?: () => void;
  generateThumbnail?: boolean;
}

const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({
  videoId,
  thumbnailUrl,
  videoThumbnailTimestamp,
  onError,
  generateThumbnail = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Set up thumbnail generation for YouTube videos
  useEffect(() => {
    if (!thumbnailUrl) {
      setIsLoading(true);
      
      // First try high-quality thumbnail
      const highQualityImage = new Image();
      highQualityImage.onload = () => {
        setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        setIsLoading(false);
      };
      
      highQualityImage.onerror = () => {
        // If high quality fails, try standard quality
        const standardImage = new Image();
        standardImage.onload = () => {
          setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
          setIsLoading(false);
        };
        
        standardImage.onerror = () => {
          // If standard quality fails, try medium quality
          const mediumImage = new Image();
          mediumImage.onload = () => {
            setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
            setIsLoading(false);
          };
          
          mediumImage.onerror = () => {
            // Fall back to default thumbnail
            setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/default.jpg`);
            setIsLoading(false);
          };
          
          mediumImage.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        };
        
        standardImage.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      };
      
      highQualityImage.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (posterRef.current) {
      const img = posterRef.current;
      if (img.complete) {
        setIsLoading(false);
      } else {
        img.onload = () => setIsLoading(false);
        img.onerror = () => {
          // If provided thumbnail fails, fall back to YouTube generated ones
          const fallbackImage = new Image();
          fallbackImage.onload = () => {
            setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
            setIsLoading(false);
          };
          
          fallbackImage.onerror = () => {
            setIsLoading(false);
            setHasError(true);
            if (onError) onError();
          };
          
          fallbackImage.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        };
      }
    }
  }, [videoId, thumbnailUrl, onError]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleIframeError = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&showinfo=0&modestbranding=1`;
    }
  };

  // Determine which thumbnail to use
  const displayThumbnail = thumbnailUrl || generatedThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div 
      className="bookmark-thumbnail group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Thumbnail unavailable</p>
        </div>
      ) : (
        <>
          {/* Static thumbnail (shown when not hovering) */}
          <img
            ref={posterRef}
            src={displayThumbnail}
            alt="Video thumbnail"
            className={`w-full h-full object-cover ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onError={() => {
              // If the thumbnail fails to load, try a fallback YouTube thumbnail
              if (posterRef.current) {
                posterRef.current.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
          />
          
          {/* YouTube iframe preview (shown when hovering) */}
          <div 
            className={`absolute inset-0 bg-black overflow-hidden ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          >
            {isHovered && (
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&loop=1&playlist=${videoId}&start=${videoThumbnailTimestamp}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onError={handleIframeError}
              ></iframe>
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
          
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            YouTube
          </div>
        </>
      )}
    </div>
  );
};

export default YouTubeThumbnail;
