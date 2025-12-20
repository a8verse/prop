"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const heroTexts = [
  "BUYING PROPERTY",
  "Live The Luxury",
  "You Deserve",
  "Select & Secure",
];

export default function HeroSection() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const currentText = heroTexts[currentTextIndex];
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayText(currentText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
          setDisplayText("");
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentTextIndex]);

  return (
    <div className="bg-transparent p-4 sm:p-6 md:p-8 flex flex-col justify-center w-full h-full max-h-full overflow-hidden text-center md:text-left">
      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        <div className="text-xs sm:text-sm uppercase tracking-wider text-primary">
          {heroTexts[0]}
        </div>
        <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white">
          {displayText}
          <span className="animate-pulse">|</span>
        </div>
        <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80">
          {heroTexts[2]}
        </div>
        <div className="text-sm sm:text-base md:text-lg text-white/60">
          {heroTexts[3]}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 lg:pt-8 justify-center md:justify-start">
          <Link
            href="/login?type=visitor"
            className="px-6 md:px-8 py-3 md:py-3 bg-primary text-black font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-primary-light transition-colors text-center shadow-lg min-h-[44px] flex items-center justify-center"
          >
            Just Login
          </Link>
          <Link
            href="/projects"
            className="px-6 md:px-8 py-3 md:py-3 border-2 border-white text-white font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-white/20 hover:border-primary transition-colors text-center backdrop-blur-sm min-h-[44px] flex items-center justify-center"
          >
            Check Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}

