
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

  // Internal Canvas resolution: 1600x2400 (4x6 paper)
  const CANVAS_W = 1600;
  const CANVAS_H = 2400;

  // Package 50 uses 2x6 strips. 
  // For Preview: We show only ONE 800x2400 strip centered.
  // For Print (not preview): We show TWO 800x2400 strips side-by-side.
  const isStrip = blueprint.package === 50;
  
  // Base strip dimensions
  const STRIP_W = isStrip ? 800 : CANVAS_W;
  const STRIP_H = CANVAS_H;

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  const renderStripContent = (offsetX: number = 0, isSecondCopy: boolean = false) => (
    <div 
      className="absolute h-full overflow-hidden bg-white" 
      style={{ 
        width: `${(STRIP_W / (isStrip && !isPreview ? CANVAS_W : STRIP_W)) * 100}%`, 
        left: `${(offsetX / (isStrip && !isPreview ? CANVAS_W : STRIP_W)) * 100}%`,
        borderRight: isStrip && !isSecondCopy && !isPreview ? '1px dashed #e5e7eb' : 'none'
      }}
    >
      {blueprint.slots.map((slot, index) => (
        <div
          key={index}
          className="absolute bg-zinc-100 overflow-hidden"
          style={{
            // Scale slot coordinates to fit within the strip
            left: `${((isStrip ? slot.x / 2 : slot.x) / STRIP_W) * 100}%`,
            top: `${(slot.y / 2400) * 100}%`, 
            width: `${((isStrip ? slot.w / 2 : slot.w) / STRIP_W) * 100}%`,
            height: `${(slot.h / 2400) * 100}%`,
          }}
        >
          {photos[index] ? (
            <Image
              src={photos[index]}
              alt="Portrait"
              fill
              className={cn("object-cover", filterClass)}
              sizes="1000px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
              <span className="text-[10px] text-black/20 font-black uppercase">POSE {index + 1}</span>
            </div>
          )}
        </div>
      ))}

      {/* Decorative Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {stickers.map((s) => {
          const def = STICKER_DEFS.find(d => d.id === s.type);
          if (!def) return null;
          const StickerIcon = def.icon;

          // Only allow editor interaction on the first copy during preview
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

      {/* Footer Branding */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white"
        style={{ height: '15%' }}
      >
        {quoteText && (
          <div className="absolute left-0 right-0 flex items-center justify-center top-2">
            <span className="font-headline font-black italic uppercase text-black/40 text-center px-4" style={{ fontSize: isStrip ? '12px' : '14px', letterSpacing: '0.1em' }}>{quoteText}</span>
          </div>
        )}

        <div className="absolute bottom-[10%] left-[10%] right-[10%] flex justify-between items-end">
          <div className="flex flex-col items-start">
             <span className="font-headline font-black italic uppercase text-black flex items-center gap-1" style={{ fontSize: isStrip ? '18px' : '24px' }}>
               <span>JNL</span>
               <span className="text-[#FF3399]">STUDIO</span>
             </span>
             <span className="font-bold uppercase tracking-[0.4em] text-black/30" style={{ fontSize: isStrip ? '6px' : '8px' }}>PHOTOBOOTH</span>
          </div>
          <span className="font-bold uppercase tracking-[0.3em] text-black/30" style={{ fontSize: isStrip ? '10px' : '14px' }}>{displayDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-white text-black overflow-hidden shadow-2xl touch-none mx-auto", className)}
      style={{
        // During preview for strips, the aspect ratio of the container is 800x2400 (1:3)
        // For grid/4x6, it is always 1600x2400 (2:3)
        aspectRatio: isStrip && isPreview ? '800 / 2400' : '1600 / 2400',
        width: isPreview ? "auto" : `${CANVAS_W}px`,
        height: isPreview ? "100%" : `${CANVAS_H}px`,
        maxHeight: isPreview ? '100%' : 'none',
      }}
      onPointerDown={() => isPreview && onSelectSticker?.("")}
    >
      {isStrip ? (
        <>
          {/* Only show one strip copy in preview. Show both for final print/saving */}
          {renderStripContent(0, false)}
          {!isPreview && renderStripContent(800, true)}
        </>
      ) : (
        renderStripContent(0, false)
      )}
    </div>
  );
});

BlueprintFrame.displayName = "BlueprintFrame";
