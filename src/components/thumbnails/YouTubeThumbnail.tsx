
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
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Set up thumbnail generation for YouTube videos
  useEffect(() => {
    if (generateThumbnail && !thumbnailUrl) {
      setIsLoading(true);
      
      // Create hidden canvas for thumbnail generation
      if (!thumbnailCanvasRef.current) {
        thumbnailCanvasRef.current = document.createElement('canvas');
        thumbnailCanvasRef.current.width = 640;
        thumbnailCanvasRef.current.height = 360;
      }
      
      // We'll use the YouTube iframe API to load the video and capture at the timestamp
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.width = '640';
      iframe.height = '360';
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&start=${videoThumbnailTimestamp}`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      
      // This is imperfect, but an approach for YouTube where we can't directly access video frames
      // Instead we'll use the high-quality thumbnail as fallback
      setTimeout(() => {
        try {
          // Use high-quality YouTube thumbnail as fallback
          setGeneratedThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
          setIsLoading(false);
        } catch (err) {
          console.error("Error generating YouTube thumbnail:", err);
          setIsLoading(false);
          setHasError(true);
          if (onError) onError();
        }
        
        // Remove iframe
        document.body.removeChild(iframe);
      }, 1500);
      
      // Append iframe to body temporarily
      document.body.appendChild(iframe);
    } else if (posterRef.current) {
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
  }, [videoId, thumbnailUrl, videoThumbnailTimestamp, onError, generateThumbnail]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Determine which thumbnail to use
  const displayThumbnail = thumbnailUrl || generatedThumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

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
