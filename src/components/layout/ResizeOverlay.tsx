"use client";

import React, { useEffect, useRef } from "react";
import { RESIZE_DEBOUNCE } from "@/lib/constants";

export function ResizeOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    lastWidthRef.current = window.innerWidth;
    const onResize = () => {
      const w = window.innerWidth;
      if (w !== lastWidthRef.current) {
        lastWidthRef.current = w;
        overlayRef.current?.classList.add("ResizeOverlay_visible__5YF40");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          overlayRef.current?.classList.remove("ResizeOverlay_visible__5YF40");
        }, RESIZE_DEBOUNCE + 100);
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={overlayRef} className="ResizeOverlay_resizeOverlay__Lc5_x">
      <div className="ResizeOverlay_gif__6aiOf">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/loading.gif"
          alt="Resizing"
          className="ResizeOverlay_gifImg__nvILO"
        />
      </div>
    </div>
  );
}
