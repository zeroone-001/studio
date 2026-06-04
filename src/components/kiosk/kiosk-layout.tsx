"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface KioskLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function KioskLayout({ children, className }: KioskLayoutProps) {
  // Generate random stars once on mount
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${(Math.random() * 3 + 2).toFixed(2)}s`,
      delay: `${(Math.random() * 5).toFixed(2)}s`,
    }));
  }, []);

  // Generate meteors
  const meteors = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 50}%`,
      right: `${Math.random() * 30}%`,
      duration: `${(Math.random() * 5 + 5).toFixed(2)}s`,
      delay: `${(Math.random() * 10).toFixed(2)}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
        {meteors.map((meteor) => (
          <div
            key={meteor.id}
            className="absolute w-[2px] h-[100px] bg-gradient-to-b from-white to-transparent opacity-0 animate-meteor"
            style={{
              top: meteor.top,
              right: meteor.right,
              animationDuration: meteor.duration,
              animationDelay: meteor.delay,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      </div>

      <div className={cn(
        "w-full h-full max-w-[1080px] bg-black/40 backdrop-blur-[2px] flex flex-col relative portrait-container z-10",
        "safe-area-inset-top safe-area-inset-bottom",
        className
      )}>
        {children}
      </div>
    </div>
  );
}