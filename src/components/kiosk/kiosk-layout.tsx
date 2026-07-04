
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

interface Meteor {
  id: number;
  top: string;
  right: string;
  duration: string;
  delay: string;
}

interface KioskLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function KioskLayout({ children, className }: KioskLayoutProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    // Optimized particle count for mobile performance
    setStars(
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 2 + 1}px`,
        duration: `${(Math.random() * 4 + 2).toFixed(2)}s`,
        delay: `${(Math.random() * 10).toFixed(2)}s`,
        opacity: Math.random() * 0.8 + 0.2,
      }))
    );

    setMeteors(
      Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 50}%`,
        right: `${Math.random() * 30}%`,
        duration: `${(Math.random() * 2 + 3).toFixed(2)}s`,
        delay: `${(Math.random() * 20).toFixed(2)}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden touch-none select-none w-screen h-[100dvh]">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle shadow-[0_0_8px_rgba(255,255,255,0.6)]"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDuration: star.duration,
              animationDelay: star.delay,
              willChange: "opacity, transform"
            }}
          />
        ))}
        {meteors.map((meteor) => (
          <div
            key={meteor.id}
            className="absolute w-[2px] h-[150px] bg-gradient-to-b from-white via-primary/40 to-transparent opacity-0 animate-meteor"
            style={{
              top: meteor.top,
              right: meteor.right,
              animationDuration: meteor.duration,
              animationDelay: meteor.delay,
              willChange: "transform, opacity"
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      </div>

      <div className={cn(
        "kiosk-container z-10 bg-black/5 backdrop-blur-[0.5px]",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
