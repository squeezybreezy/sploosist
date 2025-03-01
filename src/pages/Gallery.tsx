
import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';

// Gallery images from uploads
const galleryImages = [
  "/lovable-uploads/a7013abd-a4a8-4c30-a7a6-9c117bcdabbf.png",
  "/lovable-uploads/0830048b-96b4-47f0-849e-df1106607536.png",
  "/lovable-uploads/65a87bd0-87f9-47b6-9751-e9ea7cfc6691.png",
  "/lovable-uploads/3e2b1e93-199b-4630-9516-47134aa20eac.png",
  "/lovable-uploads/f5bc094b-2d1f-4405-a52d-c3106483dc0c.png",
  "/lovable-uploads/8b423681-4232-4723-b76b-fabca1cf08f0.png",
  "/lovable-uploads/7f0161ff-3ca7-4a91-9d55-a5fe53781187.png",
  "/lovable-uploads/1fe8efd4-b555-4d61-b039-d45a91233778.png",
  "/lovable-uploads/73d9db61-e39c-44cc-9d1a-530f82bfd8b0.png",
  "/lovable-uploads/83d1736b-7d81-477d-aa7f-825c90956bae.png",
  "/lovable-uploads/ce15ce12-deb4-4010-9808-fd5ea4b47f93.png",
  "/lovable-uploads/7c0dccca-0d8a-477f-9367-3d1f6685297a.png",
  "/lovable-uploads/55b73882-4157-454a-bf28-9264517a9121.png",
  "/lovable-uploads/cf2d4b61-f21d-4302-8226-b6e41b2b976e.png",
  "/lovable-uploads/b8e50679-a199-4750-a962-4528cf47bc2e.png",
  "/lovable-uploads/28062f8b-a24e-414c-a700-96aabe2e7d88.png",
  "/lovable-uploads/bed518de-5204-44de-9f00-e373b4738873.png",
  "/lovable-uploads/3897982e-173a-4c2e-81cd-0ad0d35e8c63.png",
  "/lovable-uploads/55c57947-d10c-4ab6-bb9a-66444bd0a128.png",
  "/lovable-uploads/8cf351a1-a0bd-49be-a7f1-df1bd6b7744e.png",
  "/lovable-uploads/9f36c6e9-3d0f-4ae5-aa1d-e093aaa90df4.png"
];

// Fun descriptions for the images
const descriptions = [
  "Stay Wild",
  "Too Hot To Handle",
  "Sweet Dreams",
  "Candy Crush",
  "Stay Up All Night",
  "Pink Vibes",
  "Neon Lights",
  "Sugar Rush",
  "Summer Mood",
  "Cute But Psycho",
  "Sweet Like Candy",
  "Good Vibes Only",
  "Sunshine Smile",
  "Living The Dream",
  "Happy Place",
  "Sparkle & Shine",
  "Adventure Time",
  "Cherry On Top",
  "Favorite Fantasy",
  "Sweetest Thing",
  "Daddy's Girl"
];

const Gallery = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Shuffle the images for a random display each time
    const shuffled = [...galleryImages].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
    
    // Set loaded to true after a small delay to trigger animations
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#6E59A5] to-[#FF6B9F] text-white">
        <div className="container mx-auto py-12 px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Mackie's Secret Gallery
          </motion.h1>
          
          <motion.p 
            className="text-xl text-center mb-12 max-w-2xl mx-auto text-pink-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            You found the hidden collection! Enjoy these exclusive images that only you know about.
          </motion.p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {shuffledImages.map((imageSrc, index) => (
              <motion.div 
                key={index}
                className="relative overflow-hidden rounded-xl shadow-2xl group"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={loaded ? { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0, 
                  transition: { 
                    delay: index * 0.05, 
                    duration: 0.5,
                    ease: "easeOut"
                  } 
                } : {}}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={imageSrc} 
                    alt={descriptions[index % descriptions.length]}
                    className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay with animation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Neon glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-pink-500/30 to-purple-500/30"></div>
                  
                  {/* Image info that appears on hover */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={hoveredIndex === index ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-black/30 backdrop-blur-sm rounded-lg p-3"
                    >
                      <h3 className="text-lg font-bold text-white mb-1">
                        {descriptions[index % descriptions.length]}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-pink-200">
                          {Math.floor(Math.random() * 100) + 30} splats
                        </p>
                        <button 
                          className="text-sm bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-full transition-colors shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Could add splat functionality here
                          }}
                        >
                          Splat!
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <p className="text-lg text-pink-200 mb-4">
              This gallery is our little secret. Only those who know where to click can find it!
            </p>
            <p className="text-sm text-purple-300 italic">
              Remember to splat your favorites!
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Gallery;
