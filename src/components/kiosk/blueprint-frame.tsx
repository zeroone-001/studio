
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";

interface BlueprintFrameProps {
  blueprint: FrameBlueprint;
  photos: string[];
  quoteText?: string;
  dateText?: string;
  filterClass?: string;
  className?: string;
  isPreview?: boolean;
}

export function BlueprintFrame({
  blueprint,
  photos,
  quoteText,
  dateText,
  filterClass,
  className,
  isPreview = false,
}: BlueprintFrameProps) {
  // Safety check to prevent crash if blueprint is undefined
  if (!blueprint || !blueprint.slots) {
    return (
      <div className={cn("bg-zinc-900 flex items-center justify-center text-white/20 text-[10px] font-black uppercase italic", className)} style={{ aspectRatio: '1600/2560' }}>
        Awaiting Blueprint...
      </div>
    );
  }

  // 1600 x 2560 canvas scale factor
  const CANVAS_W = 1600;
  const CANVAS_H = 2560;
  const FOOTER_Y = 1880;

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  return (
    <div
      className={cn(
        "relative bg-white text-black overflow-hidden shadow-2xl",
        className
      )}
      style={{
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        width: isPreview ? "100%" : `${CANVAS_W}px`,
        height: isPreview ? "auto" : `${CANVAS_H}px`,
      }}
    >
      {/* Photo Slots */}
      {blueprint.slots.map((slot, index) => {
        const photo = photos[index] || "https://picsum.photos/seed/placeholder/800/1200";
        return (
          <div
            key={index}
            className="absolute bg-zinc-100 overflow-hidden"
            style={{
              left: `${(slot.x / CANVAS_W) * 100}%`,
              top: `${(slot.y / CANVAS_H) * 100}%`,
              width: `${(slot.w / CANVAS_W) * 100}%`,
              height: `${(slot.h / CANVAS_H) * 100}%`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={photo}
                alt={`Shot ${index + 1}`}
                fill
                className={cn("object-cover", filterClass)}
              />
            </div>
          </div>
        );
      })}

      {/* Footer Area - Fixed Positioning */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: `${(FOOTER_Y / CANVAS_H) * 100}%` }}
      >
        {/* Divider line */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 h-[2px] bg-black/10"
          style={{ top: '20px', width: '1400px' }}
        />

        {/* Quote */}
        {quoteText && (
          <div 
            className="absolute left-0 right-0 flex items-center justify-center px-12"
            style={{ top: '60px', height: '60px' }}
          >
            <span 
              className="font-headline font-black italic uppercase text-center leading-none"
              style={{ fontSize: '48px' }}
            >
              {quoteText}
            </span>
          </div>
        )}

        {/* Branding & Metadata */}
        <div className="absolute bottom-[60px] left-[60px] right-[60px] flex justify-between items-end">
          <div className="flex flex-col">
             <span className="font-headline font-black italic text-black uppercase" style={{ fontSize: '32px' }}>JNL STUDIO</span>
             <span className="text-[14px] font-bold opacity-30 uppercase tracking-[0.3em]">Premium Portraits</span>
          </div>
          <div className="text-right">
             <span className="font-bold uppercase tracking-widest text-black/40" style={{ fontSize: '20px' }}>{displayDate}</span>
          </div>
        </div>
      </div>

      {/* Blueprint ID (Preview Only) */}
      {isPreview && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] px-1 font-mono pointer-events-none z-50">
          {blueprint.id}
        </div>
      )}
    </div>
  );
}
