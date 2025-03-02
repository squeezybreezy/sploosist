
import React, { useState, useRef, useEffect } from 'react';
import { Play, AlertTriangle, Loader } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DirectVideoThumbnailProps {
  url: string;
  thumbnailUrl?: string;
  videoThumbnailTimestamp: number;
  onError?: () => void;
}

const DirectVideoThumbnail: React.FC<DirectVideoThumbnailProps> = ({
  url,
  thumbnailUrl,
  videoThumbnailTimestamp,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!!thumbnailUrl);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  // Generate thumbnail at specified timestamp
  useEffect(() => {
    // Only generate thumbnail if no thumbnail URL was provided
    if (!thumbnailUrl) {
      const generateThumbnail = async () => {
        setIsLoading(true);
        
        try {
          const canvas = document.createElement("canvas");
          const video = document.createElement("video");

          video.crossOrigin = "anonymous";
          video.muted = true;
          
          // Set up event handlers before setting src to avoid race conditions
          let thumbnailGenerated = false;
          
          video.onloadedmetadata = () => {
            video.currentTime = videoThumbnailTimestamp;
          };
          
          video.oncanplay = () => {
            // Sometimes the seek may not be ready yet
            if (video.currentTime < videoThumbnailTimestamp - 0.1) {
              video.currentTime = videoThumbnailTimestamp;
            }
          };
          
          // Handle cases where seeking might fail or video can't be played
          const timeoutId = setTimeout(() => {
            if (!thumbnailGenerated) {
              console.log("Video thumbnail generation timed out");
              setIsLoading(false);
              setHasError(true);
              if (onError) onError();
              
              // Clean up
              video.pause();
              video.src = "";
              video.load();
            }
          }, 10000); // 10 second timeout
          
          video.onseeked = () => {
            if (thumbnailGenerated) return; // Avoid duplicate processing
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
                setGeneratedThumbnail(thumbnail);
                thumbnailGenerated = true;
                setIsLoading(false);
                clearTimeout(timeoutId);
              } catch (error) {
                console.error("Error generating thumbnail:", error);
              }
            }
            
            // Clean up
            video.pause();
            video.src = "";
            video.load();
          };
          
          video.onerror = () => {
            console.error("Error loading video for thumbnail generation", video.error);
            setIsLoading(false);
            setHasError(true);
            if (onError) onError();
            clearTimeout(timeoutId);
          };
          
          // Set the source last after all handlers are set up
          video.src = url;
          
        } catch (error) {
          console.error("Thumbnail generation error:", error);
          setIsLoading(false);
          setHasError(true);
          if (onError) onError();
        }
      };

      generateThumbnail();
    } else if (posterRef.current) {
      // If thumbnail URL is provided, check if it loads properly
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
  }, [url, thumbnailUrl, videoThumbnailTimestamp, onError]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      // Reset the video to the timestamp when hovering
      videoRef.current.currentTime = videoThumbnailTimestamp;
      videoRef.current.play().catch(error => {
        console.error("Error playing video on hover:", error);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Determine which thumbnail to use
  const displayThumbnail = thumbnailUrl || generatedThumbnail;

  return (
    <div 
      className="bookmark-thumbnail group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Video unavailable</p>
        </div>
      ) : (
        <>
          {/* Static thumbnail (shown when not hovering) */}
          {displayThumbnail ? (
            <img
              ref={posterRef}
              src={displayThumbnail}
              alt="Video thumbnail"
              className={`w-full h-full object-cover ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
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
            onError={handleVideoError}
            poster={displayThumbnail || undefined}
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
        </>
      )}
    </div>
  );
};

export default DirectVideoThumbnail;
