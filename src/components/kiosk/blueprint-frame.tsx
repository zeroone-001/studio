
"use client";

import * as React from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FrameBlueprint } from "./frame-blueprint";
import { cn } from "@/lib/utils";
import { 
  PlacedSticker, 
  STICKER_DEFS 
} from "@/lib/kiosk/constants";
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
  onDuplicateSticker?: (sticker: PlacedSticker) => void;
  onSelectSlot?: (index: number) => void;
  selectedSlotIndex?: number | null;
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
  onDuplicateSticker,
  onSelectSlot,
  selectedSlotIndex = null,
}: BlueprintFrameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setCanvasRect(containerRef.current.getBoundingClientRect());
    }
  }, [isPreview, blueprint]);

  if (!blueprint || !blueprint.slots) return null;

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
      <div className="absolute inset-0 z-0 bg-white">
        {blueprint.slots.map((slot, index) => {
          if (slot.w === 0 || slot.h === 0) return null;
          
          const sX = isStrip ? slot.x / 2 : slot.x;
          const sW = isStrip ? slot.w / 2 : slot.w;
          const isSelected = selectedSlotIndex === index;
          const hasPhoto = !!photos[index];

          return (
            <div
              key={index}
              className={cn(
                "absolute bg-zinc-100 overflow-hidden cursor-pointer transition-all",
                isSelected && isPreview && "ring-4 ring-primary ring-inset z-20"
              )}
              style={{
                left: `${(sX / STRIP_W) * 100}%`,
                top: `${(slot.y / 2400) * 100}%`, 
                width: `${(sW / STRIP_W) * 100}%`,
                height: `${(slot.h / 2400) * 100}%`,
              }}
              onClick={() => isPreview && onSelectSlot?.(index)}
            >
              {hasPhoto ? (
                <Image
                  src={photos[index]}
                  alt={`Portrait ${index + 1}`}
                  fill
                  className={cn("object-cover", isSelected && isPreview && "opacity-80")}
                  style={{ filter: filterClass }}
                  sizes="800px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-black/10">
                  <span className="text-[12px] text-black/20 font-black uppercase italic tracking-tighter">PHOTO {index + 1}</span>
                  <span className="text-[8px] text-black/10 font-bold uppercase mt-1">SLOT</span>
                </div>
              )}
              {isSelected && isPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <span className="bg-primary text-white text-[8px] font-black px-2 py-1 uppercase rounded-full">SELECTED</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
                onDuplicate={(st) => onDuplicateSticker?.(st)}
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
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scaleX(${s.flipX ? -1 : 1}) scaleY(${s.flipY ? -1 : 1})`,
                zIndex: s.zIndex
              }}
            >
              <StickerIcon className={cn("w-full h-full drop-shadow-md", def.color)} />
            </div>
          );
        })}
      </div>

      {/* FOOTER AREA */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white z-[60] flex flex-col items-center px-4"
        style={{ height: '8.33%' }}
      >
        <div className="w-full border-t border-black/10 mt-1"></div>
        
        <div className="flex-1 flex items-center justify-center w-full px-2 text-center overflow-hidden">
          {quoteText && (
            <p className="font-bold text-black italic text-center leading-tight line-clamp-2" style={{ fontSize: isStrip ? '12px' : '20px' }}>
              "{quoteText}"
            </p>
          )}
        </div>

        <div className="w-full flex justify-between items-end pb-2 border-t border-black/5 pt-1">
          <div className="flex flex-col items-start leading-none">
             <span className="font-headline font-black italic uppercase text-black flex items-center gap-1" style={{ fontSize: isStrip ? '10px' : '16px' }}>
               <span>JNL</span>
               <span className="text-[#FF3399]">STUDIO</span>
             </span>
          </div>
          <span className="font-bold uppercase tracking-widest text-black/40" style={{ fontSize: isStrip ? '8px' : '12px' }}>{displayDate}</span>
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
