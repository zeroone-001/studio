
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  STICKER_DEFS, 
  PlacedSticker 
} from "@/lib/kiosk/constants";
import { X, RotateCw, Maximize2, Copy } from "lucide-react";

interface StickerEditorProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onDuplicate: (sticker: PlacedSticker) => void;
  canvasRect: DOMRect | null;
}

export const StickerEditor = React.memo(({ 
  sticker, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onSelect,
  onDuplicate,
  canvasRect 
}: StickerEditorProps) => {
  const def = STICKER_DEFS.find(d => d.id === sticker.type);
  if (!def) return null;
  const StickerIcon = def.icon;

  const [isInteracting, setIsInteracting] = useState(false);
  const [localTransform, setLocalTransform] = useState({
    x: sticker.x,
    y: sticker.y,
    size: sticker.size,
    rotation: sticker.rotation,
  });

  const interactionType = useRef<'drag' | 'rotate' | 'resize' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startValue = useRef({ x: 0, y: 0, size: 0, rotation: 0, angle: 0 });

  useEffect(() => {
    if (!isInteracting) {
      setLocalTransform({
        x: sticker.x,
        y: sticker.y,
        size: sticker.size,
        rotation: sticker.rotation,
      });
    }
  }, [sticker, isInteracting]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsInteracting(true);
    interactionType.current = 'drag';
    startPos.current = { x: e.clientX, y: e.clientY };
    startValue.current = { ...localTransform, angle: 0 };
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsInteracting(true);
    interactionType.current = 'rotate';
    if (!canvasRect) return;
    
    const centerX = canvasRect.left + (localTransform.x / 100) * canvasRect.width;
    const centerY = canvasRect.top + (localTransform.y / 100) * canvasRect.height;
    
    startValue.current = { 
      ...localTransform, 
      angle: Math.atan2(e.clientY - centerY, e.clientX - centerX) 
    };
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsInteracting(true);
    interactionType.current = 'resize';
    startPos.current = { x: e.clientX, y: e.clientY };
    startValue.current = { ...localTransform, angle: 0 };
  };

  useEffect(() => {
    if (!isInteracting) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!canvasRect) return;

      if (interactionType.current === 'drag') {
        const dx = ((e.clientX - startPos.current.x) / canvasRect.width) * 100;
        const dy = ((e.clientY - startPos.current.y) / canvasRect.height) * 100;
        
        setLocalTransform(prev => ({
          ...prev,
          x: Math.max(0, Math.min(100, startValue.current.x + dx)),
          y: Math.max(0, Math.min(100, startValue.current.y + dy))
        }));
      }

      if (interactionType.current === 'rotate') {
        const centerX = canvasRect.left + (localTransform.x / 100) * canvasRect.width;
        const centerY = canvasRect.top + (localTransform.y / 100) * canvasRect.height;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const rotationDiff = (currentAngle - startValue.current.angle) * (180 / Math.PI);
        
        setLocalTransform(prev => ({
          ...prev,
          rotation: (startValue.current.rotation + rotationDiff) % 360
        }));
      }

      if (interactionType.current === 'resize') {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sizeFactor = (dist / canvasRect.width) * 100;
        
        const centerX = canvasRect.left + (localTransform.x / 100) * canvasRect.width;
        const centerY = canvasRect.top + (localTransform.y / 100) * canvasRect.height;
        const isMovingAway = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)) > 
                             Math.sqrt(Math.pow(startPos.current.x - centerX, 2) + Math.pow(startPos.current.y - centerY, 2));

        const newSize = isMovingAway 
          ? Math.min(60, startValue.current.size + sizeFactor * 0.8)
          : Math.max(5, startValue.current.size - sizeFactor * 0.8);

        setLocalTransform(prev => ({ ...prev, size: newSize }));
      }
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
      interactionType.current = null;
      onUpdate(sticker.id, {
        x: localTransform.x,
        y: localTransform.y,
        size: localTransform.size,
        rotation: localTransform.rotation
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isInteracting, localTransform, canvasRect, sticker.id, onUpdate]);

  return (
    <div
      data-sticker-id={sticker.id}
      className={cn(
        "absolute pointer-events-auto touch-none select-none",
        isSelected ? "z-[1000]" : "z-40"
      )}
      style={{
        left: `${localTransform.x}%`,
        top: `${localTransform.y}%`,
        width: `${localTransform.size}%`,
        aspectRatio: "1/1",
        transform: `translate3d(-50%, -50%, 0) rotate(${localTransform.rotation}deg)`,
        willChange: isInteracting ? "transform, left, top, width" : "auto",
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={cn(
        "w-full h-full transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded-lg animate-neon-pulse shadow-[0_0_20px_rgba(255,51,153,0.5)]"
      )}>
        <StickerIcon className={cn("w-full h-full drop-shadow-lg", def.color)} />
      </div>

      {isSelected && (
        <>
          {/* TOP LEFT: COPY */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onDuplicate(sticker); }}
            className="absolute -top-5 -left-5 w-10 h-10 bg-zinc-950/80 rounded-full flex items-center justify-center text-indigo-400 shadow-xl border border-white/20 active:scale-90 z-[1100] transition-transform"
          >
            <Copy className="w-5 h-5" strokeWidth={2.5} />
          </button>

          {/* TOP RIGHT: DELETE */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onDelete(sticker.id); }}
            className="absolute -top-5 -right-5 w-10 h-10 bg-zinc-950/80 rounded-full flex items-center justify-center text-red-500 shadow-xl border border-white/20 active:scale-90 z-[1100] transition-transform"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>

          {/* BOTTOM LEFT: ROTATE */}
          <div
            onPointerDown={handleRotateStart}
            className="absolute -bottom-5 -left-5 w-10 h-10 bg-zinc-950/80 rounded-full flex items-center justify-center text-blue-400 shadow-xl border border-white/20 cursor-pointer active:scale-90 z-[1100] transition-transform"
          >
            <RotateCw className="w-5 h-5" strokeWidth={2.5} />
          </div>

          {/* BOTTOM RIGHT: RESIZE */}
          <div
            onPointerDown={handleResizeStart}
            className="absolute -bottom-5 -right-5 w-10 h-10 bg-zinc-950/80 rounded-full flex items-center justify-center text-primary shadow-xl border border-white/20 cursor-se-resize active:scale-90 z-[1100] transition-transform"
          >
            <Maximize2 className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </>
      )}
    </div>
  );
});

StickerEditor.displayName = "StickerEditor";
