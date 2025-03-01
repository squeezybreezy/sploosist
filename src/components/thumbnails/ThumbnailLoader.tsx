
import React from 'react';

interface ThumbnailLoaderProps {
  isLoading: boolean;
}

const ThumbnailLoader: React.FC<ThumbnailLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 animate-pulse-soft">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
};

export default ThumbnailLoader;
