"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface SliderImage {
  id: string;
  imageUrl: string;
  link?: string | null;
  title?: string | null;
}

interface FooterProps {
  images?: SliderImage[];
}

export default function Footer({ images = [] }: FooterProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const imageWidth = 100 / 6; // Each image takes 1/6 of the width (16.67%)
  const scrollSpeed = 0.02; // Percentage to scroll per frame (adjust for speed)

  // Normalize URL - add https:// if missing
  const normalizeUrl = (url: string | null | undefined): string => {
    if (!url || url.trim() === "") return "#";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    // If it starts with //, add https:
    if (trimmedUrl.startsWith("//")) {
      return `https:${trimmedUrl}`;
    }
    return `https://${trimmedUrl}`;
  };

  useEffect(() => {
    if (images.length === 0 || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Smooth continuous scrolling
      setScrollPosition((prev) => {
        const newPosition = prev + scrollSpeed;
        const maxScroll = images.length * imageWidth;
        
        // When we've scrolled through one full set, reset to 0 for seamless loop
        if (newPosition >= maxScroll) {
          return newPosition - maxScroll;
        }
        return newPosition;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [images.length, isPaused, imageWidth, scrollSpeed]);

  // If no images, show placeholders
  if (images.length === 0) {
    return (
      <footer className="w-full py-1 sm:py-2 mb-4 sm:mb-6 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex overflow-hidden h-12 sm:h-16 md:h-24 gap-1 sm:gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`placeholder-${idx}`} className="flex-shrink-0 h-full" style={{ width: `calc(${imageWidth}% - 0.25rem)` }}>
              <div className="relative w-full h-full overflow-hidden bg-black/40 border-2 border-primary/30 flex items-center justify-center hover:border-primary/60 transition-colors cursor-pointer mr-1 sm:mr-2">
                <span className="text-primary font-bold text-xs sm:text-sm md:text-base">Slider {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </footer>
    );
  }

  // Duplicate images for seamless infinite loop
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <footer className="w-full py-1 sm:py-2 mb-4 sm:mb-6 bg-black/30 backdrop-blur-sm flex-shrink-0">
      <div
        ref={containerRef}
        className="flex overflow-hidden h-12 sm:h-16 md:h-24 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          transform: `translateX(-${scrollPosition}%)`,
          transition: "none", // No transition for smooth continuous scrolling
        }}
      >
        {duplicatedImages.map((image, idx) => (
          <div key={`${image.id}-${idx}`} className="flex-shrink-0 mr-1 sm:mr-2" style={{ width: `calc(${imageWidth}% - 0.25rem)` }}>
            {image.link ? (
              <Link 
                href={normalizeUrl(image.link)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.title || "Slider image"}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                    unoptimized
                    onError={(e) => {
                      console.error('Image load error:', image.imageUrl);
                      (e.target as HTMLImageElement).src = '/images/background.jpg';
                    }}
                  />
                </div>
              </Link>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.title || "Slider image"}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    console.error('Image load error:', image.imageUrl);
                    (e.target as HTMLImageElement).src = '/images/background.jpg';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}

