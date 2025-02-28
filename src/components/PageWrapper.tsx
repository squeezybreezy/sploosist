
import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen pb-[350px] md:pb-[350px] relative">
      {children}
      <div className="h-[350px] w-full pointer-events-none" />
    </div>
  );
};

export default PageWrapper;
