"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";
import { STICKER_DEFS, PlacedSticker, QUOTES } from "@/app/page";
import { X } from "lucide-react";

interface BlueprintFrameProps {
  blueprint: FrameBlueprint;
  photos: string[];
  quoteText?: string;
  dateText?: string;
  filterClass?: string;
  className?: string;
  isPreview?: boolean;
  stickers?: PlacedSticker[];
  selectedStickerId?: string | null;
  onStickerPointerDown?: (id: string) => void;
  onRemoveSticker?: (id: string) => void;
}

export function BlueprintFrame({
  blueprint,
  photos,
  quoteText,
  dateText,
  filterClass,
  className,
  isPreview = false,
  stickers = [],
  selectedStickerId = null,
  onStickerPointerDown,
  onRemoveSticker,
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
  // FOOTER START (Higher value means less footer space, more photo space)
  const FOOTER_Y = 2420; 

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  return (
    <div
      className={cn(
        "relative bg-white text-black overflow-hidden shadow-2xl touch-none",
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
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        );
      })}

      {/* Stickers Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {stickers.map((s) => {
          const def = STICKER_DEFS.find(d => d.id === s.type);
          if (!def) return null;
          const Icon = def.icon;
          const isSelected = selectedStickerId === s.id;
          
          return (
            <div
              key={s.id}
              className={cn(
                "absolute pointer-events-auto cursor-move active:scale-105 transition-all group",
                isPreview ? "drop-shadow-lg" : "",
                isSelected && isPreview ? "ring-2 ring-primary ring-offset-2 rounded-lg z-50 animate-neon-pulse" : ""
              )}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%, -50%)`,
                width: `${s.size}%`,
                aspectRatio: "1/1"
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onStickerPointerDown?.(s.id);
              }}
            >
              <Icon className={cn("w-full h-full", def.color)} strokeWidth={3} />
              
              {/* Delete Option (Visible only in preview/decoration mode) */}
              {isPreview && onRemoveSticker && isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSticker(s.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform z-50 border-2 border-white"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={4} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Area - Optimized for minimal space / save paper */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: `${(FOOTER_Y / CANVAS_H) * 100}%` }}
      >
        {/* Very subtle Divider line */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 h-[1px] bg-black/5"
          style={{ top: '10px', width: '1500px' }}
        />

        {/* Small Quote */}
        {quoteText && quoteText.length > 0 && (
          <div 
            className="absolute left-0 right-0 flex items-center justify-center px-8"
            style={{ top: '15px', height: '40px' }}
          >
            <span 
              className="font-headline font-black italic uppercase text-center leading-none text-black/80"
              style={{ fontSize: '32px' }}
            >
              {quoteText}
            </span>
          </div>
        )}

        {/* Small Branding & Tiny Date */}
        <div className="absolute bottom-[20px] left-[60px] right-[60px] flex justify-between items-center">
          <div>
             <span className="font-headline font-black italic text-black/60 uppercase tracking-tighter" style={{ fontSize: '20px' }}>JNL STUDIO</span>
          </div>
          <div className="text-right">
             <span className="font-bold uppercase tracking-[0.2em] text-black/30" style={{ fontSize: '14px' }}>{displayDate}</span>
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

