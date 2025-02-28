
import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/lovable-uploads/c588d81a-2dae-41f9-bc1a-bf1d02de2852.png')" }}>
      <div className="min-h-screen relative backdrop-blur-sm bg-black/30">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
