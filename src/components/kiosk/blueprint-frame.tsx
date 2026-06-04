
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";
import { PlacedSticker, STICKER_DEFS } from "@/app/page";
import { JnlLogo } from "./jnl-logo";
import { StickerEditor } from "./sticker-editor";

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
  onUpdateSticker?: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker?: (id: string) => void;
  onSelectSticker?: (id: string) => void;
  onBringToFront?: (id: string) => void;
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
  onUpdateSticker,
  onRemoveSticker,
  onSelectSticker,
  onBringToFront,
}: BlueprintFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setCanvasRect(containerRef.current.getBoundingClientRect());
    }
  }, [isPreview]);

  if (!blueprint || !blueprint.slots) return null;

  const CANVAS_W = 1600;
  const CANVAS_H = 2560;
  const FOOTER_Y = 2420; // Maximum photo coverage to save paper

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-white text-black overflow-hidden shadow-2xl touch-none", className)}
      style={{
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        width: isPreview ? "100%" : `${CANVAS_W}px`,
        height: isPreview ? "auto" : `${CANVAS_H}px`,
      }}
      onPointerDown={() => isPreview && onSelectSticker?.("")}
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

      {/* Stickers Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {stickers.map((s) => {
          const def = STICKER_DEFS.find(d => d.id === s.type);
          if (!def) return null;
          const StickerIcon = def.icon;

          if (isPreview) {
            return (
              <StickerEditor
                key={s.id}
                sticker={s}
                canvasRect={canvasRect}
                isSelected={selectedStickerId === s.id}
                onUpdate={(id, up) => onUpdateSticker?.(id, up)}
                onDelete={(id) => onRemoveSticker?.(id)}
                onSelect={(id) => onSelectSticker?.(id)}
                onBringToFront={(id) => onBringToFront?.(id)}
              />
            );
          }

          // Static rendering for Export
          return (
            <div
              key={s.id}
              className="absolute pointer-events-none"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}%`,
                aspectRatio: "1/1",
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
              }}
            >
              <StickerIcon className={cn("w-full h-full drop-shadow-md", def.color)} />
            </div>
          );
        })}
      </div>

      {/* Ultra-Compact Branding Footer */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: `${(FOOTER_Y / CANVAS_H) * 100}%` }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 h-[1px] bg-black/5" style={{ top: '0px', width: '1500px' }} />
        
        {quoteText && (
          <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: '4px' }}>
            <span className="font-headline font-black italic uppercase text-black/40" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>{quoteText}</span>
          </div>
        )}

        <div className="absolute bottom-[10px] left-[40px] right-[40px] flex justify-between items-end">
          <div className="flex flex-col items-start gap-0">
             <span className="font-headline font-black italic uppercase text-black flex items-center gap-1.5" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
               <span>JNL</span>
               <span className="text-[#FF3399]">STUDIO</span>
             </span>
             <span className="font-bold uppercase tracking-[0.4em] text-black/30" style={{ fontSize: '6px' }}>PHOTOBOOTH</span>
          </div>
          <span className="font-bold uppercase tracking-[0.3em] text-black/30" style={{ fontSize: '12px' }}>{displayDate}</span>
        </div>
      </div>
    </div>
  );
}
