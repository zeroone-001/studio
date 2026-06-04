
"use client";

import React from "react";
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
  // 1600 x 2560 canvas scale factor
  const CANVAS_W = 1600;
  const CANVAS_H = 2560;

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

      {/* Quote Area */}
      {blueprint.quotePosition && quoteText && (
        <div
          className="absolute flex items-center justify-center text-center p-4"
          style={{
            left: `${(blueprint.quotePosition.x / CANVAS_W) * 100}%`,
            top: `${(blueprint.quotePosition.y / CANVAS_H) * 100}%`,
            width: `${(blueprint.quotePosition.w / CANVAS_W) * 100}%`,
            height: `${(blueprint.quotePosition.h / CANVAS_H) * 100}%`,
          }}
        >
          <span className="font-headline font-black italic uppercase tracking-tighter text-black leading-none" style={{ fontSize: 'clamp(24px, 5vw, 80px)' }}>
            {quoteText}
          </span>
        </div>
      )}

      {/* Footer: Logo & Date */}
      <div className="absolute bottom-[120px] left-[120px] right-[120px] flex justify-between items-end">
        <div className="text-left">
           <div className="font-headline font-black text-2xl tracking-tighter leading-tight">JNL <span className="text-primary">STUDIO</span></div>
           <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Premium Portrait</div>
        </div>
        <div className="text-right">
           <div className="text-sm font-black uppercase tracking-widest">{dateText || new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Blueprint Hint (Visible in Owner Mode Only) */}
      {isPreview && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] px-1 font-mono pointer-events-none">
          {blueprint.id}
        </div>
      )}
    </div>
  );
}
