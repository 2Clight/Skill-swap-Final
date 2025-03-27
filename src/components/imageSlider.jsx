// components/ImageSlider.jsx
import React, { useEffect, useState } from 'react';

const ImageSlider = () => {
  const images = [
    '/assets/aboutUs1.jpg',
    '/assets/aboutUs2.png',
    '/assets/aboutUs1.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <section className="w-full mt-20 px-4 text-center">
      <h2 className="text-4xl font-bold mb-4">About Us</h2>
      <p className="mt-4 text-lg max-w-3xl mx-auto mb-6">
        Skill Swap was founded with the mission to make learning accessible and collaborative. We believe that everyone has something to teach and something to learn. Join us in building a world where knowledge is shared freely.
      </p>

      <div className="relative max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-lg">
        <div className="h-[400px] w-full">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-74 object-cover transition-opacity duration-800"
        />
        </div>

        {/* Dot Navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 w-3 rounded-full transition-all ${
                currentIndex === index ? 'bg-teal-500' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageSlider;
