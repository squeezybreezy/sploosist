
import React, { useState, useRef } from 'react';
import { Play, ImageIcon } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DirectVideoThumbnailProps {
  url: string;
  thumbnailUrl?: string;
  videoThumbnailTimestamp: number;
}

const DirectVideoThumbnail: React.FC<DirectVideoThumbnailProps> = ({
  url,
  thumbnailUrl,
  videoThumbnailTimestamp
}) => {
  const [isLoading, setIsLoading] = useState(!!thumbnailUrl);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = videoThumbnailTimestamp;
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div 
      className="bookmark-thumbnail group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static thumbnail (shown when not hovering) */}
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
            className={`w-full h-full object-cover ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-muted ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <Play className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Video preview</p>
        </div>
      )}
      
      {/* Video preview (shown when hovering) */}
      <video
        ref={videoRef}
        src={url}
        className={`absolute inset-0 object-cover w-full h-full ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        muted
        playsInline
        loop
        onLoadedData={() => setVideoLoaded(true)}
        poster={thumbnailUrl}
      />
      
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
          <Play className="h-6 w-6 text-primary fill-primary" />
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              Video
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Hover to play preview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DirectVideoThumbnail;
