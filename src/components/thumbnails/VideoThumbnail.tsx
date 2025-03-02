
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
          video.preload = "metadata";
          
          // Set up event handlers before setting src to avoid race conditions
          let thumbnailGenerated = false;
          
          // Set up timeout for generation to prevent infinite loading
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
          }, 15000); // 15 second timeout

          // Handle loading metadata first
          video.onloadedmetadata = () => {
            // Only seek after metadata is loaded
            try {
              video.currentTime = videoThumbnailTimestamp;
            } catch (err) {
              console.error("Error setting currentTime:", err);
              
              // If seeking fails, try playing then seeking
              video.play().then(() => {
                setTimeout(() => {
                  video.currentTime = videoThumbnailTimestamp;
                }, 500);
              }).catch(playError => {
                console.error("Error playing video for thumbnail:", playError);
                clearTimeout(timeoutId);
                setIsLoading(false);
                setHasError(true);
                if (onError) onError();
              });
            }
          };
          
          // When reached the correct time in the video
          video.onseeked = () => {
            if (thumbnailGenerated) return; // Avoid duplicate processing
            
            try {
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 360;
              const ctx = canvas.getContext("2d");
              
              if (ctx) {
                try {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
                  setGeneratedThumbnail(thumbnail);
                  thumbnailGenerated = true;
                  setIsLoading(false);
                  clearTimeout(timeoutId);
                } catch (drawError) {
                  console.error("Error drawing video frame:", drawError);
                  setIsLoading(false);
                  setHasError(true);
                  if (onError) onError();
                  clearTimeout(timeoutId);
                }
              } else {
                setIsLoading(false);
                setHasError(true);
                if (onError) onError();
                clearTimeout(timeoutId);
              }
              
              // Clean up
              video.pause();
              video.src = "";
              video.load();
            } catch (seekedError) {
              console.error("Error in onseeked handler:", seekedError);
              setIsLoading(false);
              setHasError(true);
              if (onError) onError();
              clearTimeout(timeoutId);
            }
          };
          
          video.onerror = () => {
            console.error("Error loading video for thumbnail generation", video.error);
            setIsLoading(false);
            setHasError(true);
            if (onError) onError();
            clearTimeout(timeoutId);
          };
          
          // CORS issues can cause problems
          video.oncanplay = () => {
            // Attempt to capture frame again if we haven't already
            if (!thumbnailGenerated && video.currentTime < videoThumbnailTimestamp - 0.5) {
              try {
                video.currentTime = videoThumbnailTimestamp;
              } catch (err) {
                console.error("Error setting currentTime in oncanplay:", err);
              }
            }
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
      try {
        videoRef.current.currentTime = videoThumbnailTimestamp;
        videoRef.current.play().catch(error => {
          console.error("Error playing video on hover:", error);
        });
      } catch (err) {
        console.error("Error in handleMouseEnter:", err);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (err) {
        console.error("Error pausing video:", err);
      }
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Try loading the video in the background to check if it's valid
  useEffect(() => {
    // Skip if we already have an error or if we have a valid thumbnail
    if (hasError || (displayThumbnail && !isLoading)) return;
    
    const validateVideoUrl = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          console.error(`Video fetch failed with status: ${response.status}`);
          setHasError(true);
          if (onError) onError();
        }
      } catch (error) {
        console.error("Error validating video URL:", error);
        // Don't set error here, as some videos might still work despite HEAD request failing
      }
    };
    
    validateVideoUrl();
  }, [url, hasError, onError]);

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
              onError={() => {
                setHasError(true);
                if (onError) onError();
              }}
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
