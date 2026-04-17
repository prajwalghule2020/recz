'use client';

import React, { useEffect, useRef, useState } from 'react';

// --- The ArcGalleryHero Component ---
type ArcGalleryHeroProps = {
  images?: string[];
  startAngle?: number;
  endAngle?: number;
  // radius for different screen sizes
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  // size of each card for different screen sizes
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  // optional extra class on outer section
  className?: string;
  embedded?: boolean;
  showContent?: boolean;
};

const DEFAULT_ARC_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
  'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=600&q=80',
];

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
  embedded = false,
  showContent = true,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const galleryImages = images && images.length > 0 ? images : DEFAULT_ARC_IMAGES;

  // Effect to handle responsive resizing of the arc and cards
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Ensure at least 2 points to distribute angles for the arc calculation
  const count = Math.max(galleryImages.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden flex flex-col ${
        embedded ? 'bg-transparent min-h-[460px] md:min-h-[560px]' : 'bg-white dark:bg-gray-900 min-h-screen'
      } ${className}`}>
      {/* Background ring container that controls geometry */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          // Give it a bit more height to prevent clipping
          height: embedded ? dimensions.radius * 1.12 : dimensions.radius * 1.2,
        }}
      >
        {/* Center pivot for transforms - positioned at bottom center */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {/* Each image is positioned on the circle and rotated to face outward */}
          {galleryImages.map((src, i) => {
            const angle = startAngle + step * i; // degrees
            const angleRad = (angle * Math.PI) / 180;
            
            // Calculate x and y positions on the arc
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;
            
            return (
              <div
                key={i}
                className={`absolute ${hasEnteredView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: hasEnteredView ? `${i * 100}ms` : undefined,
                  animationFillMode: hasEnteredView ? 'both' : undefined,
                  zIndex: count - i,
                }}
              >
                <div 
                  className={`rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 w-full h-full ${
                    embedded
                      ? 'bg-white/12 ring-1 ring-white/15 backdrop-blur-[2px]'
                      : 'ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800'
                  }`}
                  style={{ transform: `rotate(${angle / 4}deg)` }}
                >
                  <img
                    src={src}
                    alt={`Memory ${i + 1}`}
                    className="block w-full h-full object-cover"
                    draggable={false}
                    // Add a fallback in case an image fails to load
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x400/334155/e2e8f0?text=Memory`;
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showContent && (
        <div
          className={`z-10 flex items-center justify-center px-6 ${
            embedded
              ? 'absolute inset-0 pt-24 md:pt-28 lg:pt-32'
              : 'relative flex-1 -mt-40 md:-mt-52 lg:-mt-64'
          }`}>
          <div
            className={`text-center max-w-2xl px-6 ${hasEnteredView ? 'animate-fade-in' : 'opacity-0'}`}
            style={{
              animationDelay: hasEnteredView ? '800ms' : undefined,
              animationFillMode: hasEnteredView ? 'both' : undefined,
            }}>
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${embedded ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              Rediscover Your Memories with AI
            </h1>
            <p className={`mt-4 text-lg ${embedded ? 'text-white/75' : 'text-gray-600 dark:text-gray-300'}`}>
              Our intelligent platform finds, organizes, and brings your most cherished moments back to life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Explore Your Past
              </button>
              <button className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200">
                How It Works
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 56%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 50%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation-name: fade-in-up;
          animation-duration: 1.2s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animate-fade-in {
          animation-name: fade-in;
          animation-duration: 1.1s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </section>
  );
};
