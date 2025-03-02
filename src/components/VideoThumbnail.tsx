
import React from 'react';
import { getYouTubeVideoId, isGifUrl } from '@/lib/bookmarkUtils';
import GifThumbnail from './thumbnails/GifThumbnail';
import YouTubeThumbnail from './thumbnails/YouTubeThumbnail';
import DirectVideoThumbnail from './thumbnails/VideoThumbnail';
import GenericThumbnail from './thumbnails/GenericThumbnail';

interface VideoThumbnailProps {
  url: string;
  thumbnailUrl?: string;
  videoThumbnailTimestamp?: number;
  onError?: () => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  url,
  thumbnailUrl,
  videoThumbnailTimestamp = 5, // Default to 5 seconds for better previews
  onError
}) => {
  const videoId = getYouTubeVideoId(url);
  const isGif = isGifUrl(url) || isGifUrl(thumbnailUrl || '');
  
  // Support for direct video URLs (non-YouTube)
  const isDirectVideoUrl = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url);

  // Render a GIF thumbnail
  if (isGif) {
    return (
      <GifThumbnail 
        url={url} 
        thumbnailUrl={thumbnailUrl} 
        onError={onError} 
      />
    );
  }

  // Render a YouTube embed thumbnail for YouTube videos
  if (videoId) {
    return (
      <YouTubeThumbnail 
        videoId={videoId} 
        thumbnailUrl={thumbnailUrl} 
        videoThumbnailTimestamp={videoThumbnailTimestamp} 
        onError={onError} 
        generateThumbnail={thumbnailUrl ? false : true}
      />
    );
  }

  // Render a video player for direct video URLs
  if (isDirectVideoUrl) {
    return (
      <DirectVideoThumbnail 
        url={url} 
        thumbnailUrl={thumbnailUrl} 
        videoThumbnailTimestamp={videoThumbnailTimestamp} 
        onError={onError}
      />
    );
  }

  // For other video URLs that aren't direct video files or YouTube,
  // use a generic thumbnail or the provided thumbnailUrl
  return (
    <GenericThumbnail 
      thumbnailUrl={thumbnailUrl} 
      onError={onError} 
    />
  );
};

export default VideoThumbnail;
