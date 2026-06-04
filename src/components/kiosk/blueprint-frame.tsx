
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";
import { STICKER_DEFS, PlacedSticker } from "@/app/page";
import { X, RotateCcw, Maximize2 } from "lucide-react";

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
  onRotateSticker?: (id: string) => void;
  onResizeSticker?: (id: string) => void;
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
  onRotateSticker,
  onResizeSticker,
}: BlueprintFrameProps) {
  if (!blueprint || !blueprint.slots) return null;

  const CANVAS_W = 1600;
  const CANVAS_H = 2560;
  const FOOTER_Y = 2420; 

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  return (
    <div
      className={cn("relative bg-white text-black overflow-hidden shadow-2xl touch-none", className)}
      style={{
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        width: isPreview ? "100%" : `${CANVAS_W}px`,
        height: isPreview ? "auto" : `${CANVAS_H}px`,
      }}
    >
      {blueprint.slots.map((slot, index) => (
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
          <Image
            src={photos[index] || "https://picsum.photos/seed/placeholder/800/1200"}
            alt={`Shot ${index + 1}`}
            fill
            className={cn("object-cover", filterClass)}
            sizes="1000px"
          />
        </div>
      ))}

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
                "absolute pointer-events-auto cursor-move transition-all group",
                isSelected && isPreview ? "ring-2 ring-primary ring-offset-1 rounded-lg z-50 animate-neon-pulse" : ""
              )}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%, -50%) rotate(${s.rotation || 0}deg)`,
                width: `${s.size}%`,
                aspectRatio: "1/1"
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onStickerPointerDown?.(s.id);
              }}
            >
              <Icon className={cn("w-full h-full", def.color)} strokeWidth={3} />
              
              {isPreview && isSelected && (
                <>
                  {/* Delete Button (Top-Right) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveSticker?.(s.id); }}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 border-2 border-white z-[60]"
                  >
                    <X className="w-4 h-4" strokeWidth={4} />
                  </button>
                  
                  {/* Rotate Button (Top-Left) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRotateSticker?.(s.id); }}
                    className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 border-2 border-white z-[60]"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={4} />
                  </button>

                  {/* Resize Button (Bottom-Right) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onResizeSticker?.(s.id); }}
                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 border-2 border-white z-[60]"
                  >
                    <Maximize2 className="w-4 h-4" strokeWidth={4} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: `${(FOOTER_Y / CANVAS_H) * 100}%` }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 h-[1px] bg-black/5" style={{ top: '10px', width: '1500px' }} />
        {quoteText && (
          <div className="absolute left-0 right-0 flex items-center justify-center px-8" style={{ top: '15px', height: '40px' }}>
            <span className="font-headline font-black italic uppercase text-center leading-none text-black/80" style={{ fontSize: '32px' }}>{quoteText}</span>
          </div>
        )}
        <div className="absolute bottom-[20px] left-[60px] right-[60px] flex justify-between items-center">
          <span className="font-headline font-black italic text-black/60 uppercase" style={{ fontSize: '20px' }}>JNL STUDIO</span>
          <span className="font-bold uppercase tracking-[0.2em] text-black/30" style={{ fontSize: '14px' }}>{displayDate}</span>
        </div>
      </div>
    </div>
  );
}
