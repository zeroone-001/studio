
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KioskLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function KioskLayout({ children, className }: KioskLayoutProps) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden safe-area-inset-top safe-area-inset-bottom">
      <div className={cn(
        "w-full h-full max-w-[1080px] bg-black flex flex-col relative portrait-container",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
