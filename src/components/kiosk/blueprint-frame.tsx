
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";
import { PlacedSticker, STICKER_DEFS } from "@/app/page";
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

export const BlueprintFrame = React.memo(({
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
}: BlueprintFrameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setCanvasRect(containerRef.current.getBoundingClientRect());
    }
  }, [isPreview]);

  if (!blueprint || !blueprint.slots) return null;

  // Aspect Ratio Logic
  // P50 (2x6 Strip) = 1:3 ratio -> 1600x4800
  // P100 (4x6 Photo) = 2:3 ratio -> 1600x2400
  const CANVAS_W = 1600;
  const CANVAS_H = blueprint.package === 50 ? 4800 : 2400;
  const FOOTER_HEIGHT = blueprint.package === 50 ? 600 : 300;
  const FOOTER_Y = CANVAS_H - FOOTER_HEIGHT;

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
          {photos[index] ? (
            <Image
              src={photos[index]}
              alt="Portrait result"
              fill
              className={cn("object-cover", filterClass)}
              sizes="1000px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-zinc-200 animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-black/20 font-black uppercase">Awaiting Capture</span>
            </div>
          )}
        </div>
      ))}

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

      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ top: `${(FOOTER_Y / CANVAS_H) * 100}%` }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 h-[1px] bg-black/5" style={{ top: '0px', width: '90%' }} />
        
        {quoteText && (
          <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: blueprint.package === 50 ? '20px' : '10px' }}>
            <span className="font-headline font-black italic uppercase text-black/40 text-center px-4" style={{ fontSize: blueprint.package === 50 ? '24px' : '12px', letterSpacing: '0.1em' }}>{quoteText}</span>
          </div>
        )}

        <div className="absolute bottom-[5%] left-[10%] right-[10%] flex justify-between items-end">
          <div className="flex flex-col items-start gap-0">
             <span className="font-headline font-black italic uppercase text-black flex items-center gap-1.5" style={{ fontSize: blueprint.package === 50 ? '36px' : '18px', letterSpacing: '-0.02em' }}>
               <span>JNL</span>
               <span className="text-[#FF3399]">STUDIO</span>
             </span>
             <span className="font-bold uppercase tracking-[0.4em] text-black/30" style={{ fontSize: blueprint.package === 50 ? '12px' : '6px' }}>PHOTOBOOTH</span>
          </div>
          <span className="font-bold uppercase tracking-[0.3em] text-black/30" style={{ fontSize: blueprint.package === 50 ? '24px' : '12px' }}>{displayDate}</span>
        </div>
      </div>
    </div>
  );
});

BlueprintFrame.displayName = "BlueprintFrame";
