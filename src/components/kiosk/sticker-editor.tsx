
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { 
  STICKER_DEFS, 
  PlacedSticker 
} from "@/lib/kiosk/constants";
import { X, RotateCw, Maximize2, Layers, Copy, FlipHorizontal, FlipVertical, ArrowDown } from "lucide-react";

interface StickerEditorProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onDuplicate: (sticker: PlacedSticker) => void;
  canvasRect: DOMRect | null;
}

export const StickerEditor = React.memo(({ 
  sticker, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onSelect,
  onBringToFront,
  onSendToBack,
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
    flipX: sticker.flipX || false,
    flipY: sticker.flipY || false
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
        flipX: sticker.flipX || false,
        flipY: sticker.flipY || false
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

  const handleFlipX = (e: React.PointerEvent) => {
    e.stopPropagation();
    onUpdate(sticker.id, { flipX: !localTransform.flipX });
  };

  const handleFlipY = (e: React.PointerEvent) => {
    e.stopPropagation();
    onUpdate(sticker.id, { flipY: !localTransform.flipY });
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
          x: Math.max(2, Math.min(98, startValue.current.x + dx)),
          y: Math.max(2, Math.min(98, startValue.current.y + dy))
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
      className={cn(
        "absolute pointer-events-auto touch-none group",
        isSelected ? "z-[100]" : "z-40"
      )}
      style={{
        left: `${localTransform.x}%`,
        top: `${localTransform.y}%`,
        width: `${localTransform.size}%`,
        aspectRatio: "1/1",
        transform: `translate3d(-50%, -50%, 0) rotate(${localTransform.rotation}deg) scaleX(${localTransform.flipX ? -1 : 1}) scaleY(${localTransform.flipY ? -1 : 1})`,
        willChange: isInteracting ? "transform, left, top, width" : "auto",
        zIndex: isSelected ? 1000 : sticker.zIndex
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={cn(
        "w-full h-full transition-shadow duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded-lg animate-neon-pulse shadow-[0_0_25px_rgba(255,51,153,0.7)]"
      )}>
        <StickerIcon className={cn("w-full h-full drop-shadow-lg", def.color)} />
      </div>

      {isSelected && (
        <>
          {/* Main Controls - Top Row */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onDelete(sticker.id); }}
            className="absolute -top-10 -right-10 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white active:scale-90 z-[110]"
          >
            <X className="w-6 h-6" strokeWidth={4} />
          </button>

          <button
            onPointerDown={(e) => { e.stopPropagation(); onDuplicate(sticker); }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white active:scale-90 z-[110]"
          >
            <Copy className="w-6 h-6" strokeWidth={3} />
          </button>

          <div
            onPointerDown={handleRotateStart}
            className="absolute -top-10 -left-10 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white cursor-pointer active:scale-90 z-[110]"
          >
            <RotateCw className="w-6 h-6" strokeWidth={3} />
          </div>

          {/* Resize Control - Bottom Right */}
          <div
            onPointerDown={handleResizeStart}
            className="absolute -bottom-10 -right-10 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white cursor-se-resize active:scale-90 z-[110]"
          >
            <Maximize2 className="w-6 h-6" strokeWidth={3} />
          </div>

          {/* Layer Controls - Bottom Row */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onPointerDown={(e) => { e.stopPropagation(); onBringToFront(sticker.id); }}
              className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white active:scale-90"
              title="Bring to Front"
            >
              <Layers className="w-5 h-5" strokeWidth={3} />
            </button>
            <button
              onPointerDown={(e) => { e.stopPropagation(); onSendToBack(sticker.id); }}
              className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white active:scale-90"
              title="Send to Back"
            >
              <ArrowDown className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>

          {/* Flip Controls - Middle Sides */}
          <button
            onPointerDown={handleFlipX}
            className="absolute top-1/2 -left-10 -translate-y-1/2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white active:scale-90 z-[110]"
          >
            <FlipHorizontal className="w-5 h-5" strokeWidth={3} />
          </button>
          <button
            onPointerDown={handleFlipY}
            className="absolute top-1/2 -right-10 -translate-y-1/2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white active:scale-90 z-[110]"
          >
            <FlipVertical className="w-5 h-5" strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
});

StickerEditor.displayName = "StickerEditor";
