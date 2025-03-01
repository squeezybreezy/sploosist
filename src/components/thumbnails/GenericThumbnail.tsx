
import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GenericThumbnailProps {
  thumbnailUrl?: string;
  onError?: () => void;
}

const GenericThumbnail: React.FC<GenericThumbnailProps> = ({
  thumbnailUrl,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!!thumbnailUrl);
  const posterRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (thumbnailUrl && posterRef.current) {
      const img = posterRef.current;
      if (img.complete) {
        setIsLoading(false);
      } else {
        img.onload = () => setIsLoading(false);
        img.onerror = () => {
          setIsLoading(false);
          if (onError) onError();
        };
      }
    }
  }, [thumbnailUrl, onError]);

  return (
    <div className="bookmark-thumbnail group">
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
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <Play className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Video preview</p>
        </div>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded cursor-help">
              Video
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Video preview not available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GenericThumbnail;
