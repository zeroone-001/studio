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
  }, [isPreview, blueprint, photos]);

  if (!blueprint || !blueprint.slots) return null;

  // Internal Canvas resolution: 1600x2400 (4x6 paper)
  const CANVAS_W = 1600;
  const CANVAS_H = 2400;

  const isStrip = blueprint.package === 50;
  const STRIP_W = isStrip ? 800 : CANVAS_W;

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  const renderStripContent = (offsetX: number = 0, isSecondCopy: boolean = false) => (
    <div 
      className="absolute h-full overflow-hidden bg-white" 
      style={{ 
        width: isStrip && !isPreview ? '50%' : '100%', 
        left: isStrip && !isPreview ? `${(offsetX / CANVAS_W) * 100}%` : '0',
        zIndex: 0
      }}
    >
      {/* Background Photos - Zero Gap Absolute Positioning */}
      <div className="absolute inset-0 z-0 bg-white">
        {blueprint.slots.map((slot, index) => {
          if (slot.w === 0 || slot.h === 0) return null;
          
          // Adjust coordinates for Strip if rendering Twin Copies
          const sX = isStrip ? slot.x / 2 : slot.x;
          const sW = isStrip ? slot.w / 2 : slot.w;

          return (
            <div
              key={index}
              className="absolute bg-zinc-100 overflow-hidden"
              style={{
                left: `${(sX / STRIP_W) * 100}%`,
                top: `${(slot.y / 2400) * 100}%`, 
                width: `${(sW / STRIP_W) * 100}%`,
                height: `${(slot.h / 2400) * 100}%`,
              }}
            >
              {photos[index] ? (
                <Image
                  src={photos[index]}
                  alt="Portrait"
                  fill
                  className={cn("object-cover opacity-100", filterClass)}
                  sizes="1000px"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] text-black/10 font-black uppercase">POSE {index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decorative Layer (Stickers) */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {stickers.map((s) => {
          const def = STICKER_DEFS.find(d => d.id === s.type);
          if (!def) return null;
          const StickerIcon = def.icon;

          if (isPreview && !isSecondCopy) {
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

      {/* Spacious Branding Footer - 8% Height (192px at 2400px height) */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white z-50 flex flex-col justify-center items-center px-6"
        style={{ height: '8%' }}
      >
        {/* Inspirational Quote Sentence - Added Padding for Space */}
        {quoteText && (
          <p className="font-bold text-black italic text-center leading-relaxed mb-4" style={{ fontSize: isStrip ? '10px' : '16px' }}>
            "{quoteText}"
          </p>
        )}
        <div className="w-full flex justify-between items-center border-t border-black/5 pt-3">
          <div className="flex flex-col items-start leading-none gap-0">
             <span className="font-headline font-black italic uppercase text-black flex items-center gap-1" style={{ fontSize: isStrip ? '11px' : '18px' }}>
               <span>JNL</span>
               <span className="text-[#FF3399]">STUDIO</span>
             </span>
          </div>
          <span className="font-bold uppercase tracking-[0.15em] text-black/30 leading-none" style={{ fontSize: isStrip ? '6px' : '10px' }}>{displayDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-white text-black overflow-hidden shadow-2xl touch-none mx-auto", className)}
      style={{
        aspectRatio: isStrip && isPreview ? '800 / 2400' : '1600 / 2400',
        width: isPreview ? "auto" : `${CANVAS_W}px`,
        height: isPreview ? "100%" : `${CANVAS_H}px`,
        maxHeight: isPreview ? '100%' : 'none',
        zIndex: 10
      }}
      onPointerDown={() => isPreview && onSelectSticker?.("")}
    >
      {isStrip && !isPreview ? (
        <>
          {renderStripContent(0, false)}
          {renderStripContent(800, true)}
        </>
      ) : (
        renderStripContent(0, false)
      )}
    </div>
  );
});

BlueprintFrame.displayName = "BlueprintFrame";
