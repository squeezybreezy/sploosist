
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] text-white py-8 border-t border-white/10 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Splooge Assist</h3>
            <p className="text-gray-300">
              A better way to save and organize your sexy sites. Don't forget to "splat" your favorites!
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <a href="/add" className="text-gray-300 hover:text-primary transition-colors">Add Bookmark</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">Most Splatted</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Splooge Assist. All rights reserved.</p>
        </div>
      </div>
      
      {/* Person image in bottom right corner with greeting */}
      <div className="absolute bottom-0 right-0 w-32 md:w-48 lg:w-64 xl:w-72 h-auto">
        <div className="absolute bottom-16 md:bottom-24 lg:bottom-32 right-16 md:right-24 lg:right-32 text-xl md:text-2xl font-bold text-white">
          Hi Mackie!
        </div>
        <img 
          src="/lovable-uploads/fa9fefb4-d407-4e5a-afe2-0d496f5fb688.png" 
          alt="Assistant" 
          className="object-contain"
        />
      </div>
    </footer>
  );
};

export default Footer;
