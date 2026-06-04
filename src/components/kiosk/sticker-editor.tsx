
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { STICKER_DEFS, PlacedSticker } from "@/app/page";
import { X, RotateCw, Maximize2, Layers } from "lucide-react";

interface StickerEditorProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onBringToFront: (id: string) => void;
  canvasRect: DOMRect | null;
}

export function StickerEditor({ 
  sticker, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onSelect,
  onBringToFront,
  canvasRect 
}: StickerEditorProps) {
  const def = STICKER_DEFS.find(d => d.id === sticker.type);
  if (!def) return null;
  const Icon = def.icon;

  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef(0);
  const startRotation = useRef(0);
  const startAngle = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsRotating(true);
    if (!canvasRect) return;
    
    const centerX = canvasRect.left + (sticker.x / 100) * canvasRect.width;
    const centerY = canvasRect.top + (sticker.y / 100) * canvasRect.height;
    
    startAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    startRotation.current = sticker.rotation || 0;
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.id);
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = sticker.size;
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!canvasRect) return;

      if (isDragging) {
        const dx = ((e.clientX - startPos.current.x) / canvasRect.width) * 100;
        const dy = ((e.clientY - startPos.current.y) / canvasRect.height) * 100;
        
        onUpdate(sticker.id, {
          x: Math.max(2, Math.min(98, sticker.x + dx)),
          y: Math.max(2, Math.min(98, sticker.y + dy))
        });
        startPos.current = { x: e.clientX, y: e.clientY };
      }

      if (isRotating) {
        const centerX = canvasRect.left + (sticker.x / 100) * canvasRect.width;
        const centerY = canvasRect.top + (sticker.y / 100) * canvasRect.height;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const rotationDiff = (currentAngle - startAngle.current) * (180 / Math.PI);
        
        onUpdate(sticker.id, {
          rotation: (startRotation.current + rotationDiff) % 360
        });
      }

      if (isResizing) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sizeFactor = (dist / canvasRect.width) * 100;
        
        // Use vector direction relative to sticker center to determine grow/shrink
        const centerX = canvasRect.left + (sticker.x / 100) * canvasRect.width;
        const centerY = canvasRect.top + (sticker.y / 100) * canvasRect.height;
        const isMovingAway = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)) > 
                             Math.sqrt(Math.pow(startPos.current.x - centerX, 2) + Math.pow(startPos.current.y - centerY, 2));

        const newSize = isMovingAway 
          ? Math.min(45, startSize.current + sizeFactor * 0.5)
          : Math.max(5, startSize.current - sizeFactor * 0.5);

        onUpdate(sticker.id, { size: newSize });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsRotating(false);
      setIsResizing(false);
    };

    if (isDragging || isRotating || isResizing) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, isRotating, isResizing, sticker, canvasRect, onUpdate]);

  return (
    <div
      className={cn(
        "absolute pointer-events-auto touch-none group",
        isSelected ? "z-50" : "z-40"
      )}
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        width: `${sticker.size}%`,
        aspectRatio: "1/1",
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={cn(
        "w-full h-full transition-shadow",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-transparent rounded-lg animate-neon-pulse shadow-[0_0_20px_rgba(255,51,153,0.6)]"
      )}>
        <Icon className={cn("w-full h-full drop-shadow-lg", def.color)} strokeWidth={2.5} />
      </div>

      {isSelected && (
        <>
          {/* Delete Handle */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onDelete(sticker.id); }}
            className="absolute -top-6 -right-6 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white active:scale-90 z-[60]"
          >
            <X className="w-5 h-5" strokeWidth={4} />
          </button>

          {/* Rotate Handle */}
          <div
            onPointerDown={handleRotateStart}
            className="absolute -top-6 -left-6 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white cursor-pointer active:scale-90 z-[60]"
          >
            <RotateCw className="w-5 h-5" strokeWidth={3} />
          </div>

          {/* Resize Handle */}
          <div
            onPointerDown={handleResizeStart}
            className="absolute -bottom-6 -right-6 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white cursor-se-resize active:scale-90 z-[60]"
          >
            <Maximize2 className="w-5 h-5" strokeWidth={3} />
          </div>

          {/* Layer Control */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onBringToFront(sticker.id); }}
            className="absolute -bottom-6 -left-6 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white active:scale-90 z-[60]"
          >
            <Layers className="w-5 h-5" strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
}
