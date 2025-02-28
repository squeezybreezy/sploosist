
import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';

// Example images for the collage
const images = [
  {
    src: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    alt: "Colorful Code",
    width: 5760,
    height: 3840,
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    alt: "Coding on MacBook",
    width: 3882,
    height: 2584,
  },
  {
    src: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    alt: "Orange Cat",
    width: 7504,
    height: 10000,
  },
  {
    src: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    alt: "Grey Kitten",
    width: 3057,
    height: 4585,
  },
  {
    src: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    alt: "Yellow Lights",
    width: 6000,
    height: 4000,
  },
];

const Gallery = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // For randomizing the collage on each visit
  const [shuffledImages, setShuffledImages] = useState([...images]);

  useEffect(() => {
    // Shuffle the images
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#6E59A5] text-white">
        <div className="container mx-auto py-12 px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Secret Gallery
          </motion.h1>
          
          <motion.p 
            className="text-xl text-center mb-12 max-w-2xl mx-auto text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            You found the hidden collection! Enjoy this exclusive gallery that only you know about.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {shuffledImages.map((image, index) => (
              <motion.div 
                key={index}
                className="relative overflow-hidden rounded-lg shadow-2xl group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                  
                  {/* Colorful overlay with animation */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#9b87f5]/40 to-[#D946EF]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Image info that appears on hover */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.h3 
                      className="text-lg font-semibold text-white"
                      initial={{ y: 20, opacity: 0 }}
                      animate={hoveredIndex === index ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {image.alt}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-sm text-gray-200"
                      initial={{ y: 20, opacity: 0 }}
                      animate={hoveredIndex === index ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {Math.floor(Math.random() * 100) + 1} splats
                    </motion.p>
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
            <p className="text-lg text-purple-200 mb-4">
              This gallery is our little secret. Only those who know where to click can find it!
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Gallery;
