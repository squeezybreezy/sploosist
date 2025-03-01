
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface GifThumbnailProps {
  url: string;
  thumbnailUrl?: string;
  onError?: () => void;
}

const GifThumbnail: React.FC<GifThumbnailProps> = ({
  url,
  thumbnailUrl,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const posterRef = useRef<HTMLImageElement>(null);
  
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
};

export default GifThumbnail;
