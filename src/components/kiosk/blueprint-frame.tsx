
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

  // Standard Paper size is 4x6 inches (Aspect Ratio 2:3)
  // Internal Canvas resolution: 1600x2400
  const CANVAS_W = 1600;
  const CANVAS_H = 2400;

  // For Package 50 (2x6 strips), we duplicate the strip side-by-side to fit 4x6 paper
  const isStrip = blueprint.package === 50;
  
  // A single 2x6 strip is 800x2400. Two of them make 1600x2400.
  const STRIP_W = isStrip ? 800 : CANVAS_W;
  const STRIP_H = CANVAS_H;

  const displayDate = useMemo(() => {
    if (dateText) return dateText;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, [dateText]);

  const renderStrip = (offsetX: number = 0) => (
    <div 
      className="absolute h-full overflow-hidden bg-white" 
      style={{ 
        width: `${(STRIP_W / CANVAS_W) * 100}%`, 
        left: `${(offsetX / CANVAS_W) * 100}%`,
        borderRight: isStrip && offsetX === 0 ? '1px dashed #eee' : 'none'
      }}
    >
      {blueprint.slots.map((slot, index) => (
        <div
          key={index}
          className="absolute bg-zinc-100 overflow-hidden"
          style={{
            // Coordinate mapping: blueprint slots are defined for 1600 width
            // For P50, we scale the slot width to fit the 800w strip
            left: `${(slot.x / 1600) * 100}%`,
            top: `${(slot.y / 4800) * 100}%`, // P50 slots are defined in a 4800 height space originally
            width: `${(slot.w / 1600) * 100}%`,
            height: `${(slot.h / 4800) * 100}%`,
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
              <span className="text-[10px] text-black/20 font-black uppercase">Pose {index + 1}</span>
            </div>
          )}
        </div>
      ))}

      {/* Decorative Layer for each strip */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {stickers.map((s) => {
          const def = STICKER_DEFS.find(d => d.id === s.type);
          if (!def) return null;
          const StickerIcon = def.icon;

          if (isPreview && offsetX === 0) {
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
        style={{ height: isStrip ? '12%' : '15%' }}
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
      className={cn("relative bg-white text-black overflow-hidden shadow-2xl touch-none", className)}
      style={{
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        width: isPreview ? "100%" : `${CANVAS_W}px`,
        height: isPreview ? "auto" : `${CANVAS_H}px`,
      }}
      onPointerDown={() => isPreview && onSelectSticker?.("")}
    >
      {/* For PHP 50, we render two strips. For PHP 100, we render one photo grid. */}
      {isStrip ? (
        <>
          {renderStrip(0)}
          {renderStrip(800)}
        </>
      ) : (
        <div className="w-full h-full relative">
          {blueprint.slots.map((slot, index) => (
            <div
              key={index}
              className="absolute bg-zinc-100 overflow-hidden"
              style={{
                left: `${(slot.x / 1600) * 100}%`,
                top: `${(slot.y / 2400) * 100}%`,
                width: `${(slot.w / 1600) * 100}%`,
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
                  <span className="text-[10px] text-black/20 font-black uppercase">Pose {index + 1}</span>
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
          <div className="absolute left-0 right-0 bottom-0 bg-white h-[15%]">
            <div className="absolute left-1/2 -translate-x-1/2 h-[1px] bg-black/5" style={{ top: '0px', width: '90%' }} />
            {quoteText && (
              <div className="absolute left-0 right-0 flex items-center justify-center top-2">
                <span className="font-headline font-black italic uppercase text-black/40 text-center px-4 text-[14px] tracking-widest">{quoteText}</span>
              </div>
            )}
            <div className="absolute bottom-[10%] left-[10%] right-[10%] flex justify-between items-end">
              <div className="flex flex-col items-start">
                 <span className="font-headline font-black italic uppercase text-black flex items-center gap-1.5 text-2xl">
                   <span>JNL</span>
                   <span className="text-[#FF3399]">STUDIO</span>
                 </span>
                 <span className="font-bold uppercase tracking-[0.4em] text-black/30 text-[8px]">PHOTOBOOTH</span>
              </div>
              <span className="font-bold uppercase tracking-[0.3em] text-black/30 text-[14px]">{displayDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BlueprintFrame.displayName = "BlueprintFrame";
