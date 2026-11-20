"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useLenis } from "@/components/layout/LenisProvider";
import {
  useLabModalSubscription,
  useShowcaseStore,
} from "@/stores/appStore";
import { ROUTES } from "@/lib/constants";

export function ScrollProgress() {
  const pathname = usePathname();
  const barWrapRef = useRef<HTMLDivElement>(null);
  const { onScroll } = useLenis();

  useEffect(() => {
    const unsub = onScroll((e) => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
      );
      const progress = maxScroll === 0 ? 0 : Math.min(e.scroll / maxScroll, 1);
      barWrapRef.current?.style.setProperty("--progress", progress.toFixed(2));
    });
    return () => unsub();
  }, [onScroll]);

  useEffect(() => {
    barWrapRef.current?.style.setProperty("--progress", "0");
    const hasSub = !!pathname.split("/").filter(Boolean)[1];
    const hide = (pathname === ROUTES.WORK && hasSub) || pathname === ROUTES.LAB;
    barWrapRef.current?.classList.toggle(
      "ScrollProgress_scrollProgress__visible__GxrBQ",
      !hide
    );
  }, [pathname]);

  useEffect(() => {
    let prevExpanded = false;
    return useShowcaseStore.subscribe((s) => {
      if (s.isExpanded !== prevExpanded) {
        prevExpanded = s.isExpanded;
        if (!barWrapRef.current) return;
        if (s.isExpanded) {
          gsap.to(barWrapRef.current, {
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          });
        } else {
          gsap.set(barWrapRef.current, { opacity: 1 });
        }
      }
    });
  }, []);

  useLabModalSubscription((idx) => {
    if (!barWrapRef.current) return;
    if (idx !== null) {
      gsap.to(barWrapRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    } else {
      gsap.set(barWrapRef.current, { opacity: 1 });
    }
  });

  return (
    <div className="ScrollProgress_scrollProgress__af_mY" ref={barWrapRef}>
      <div className="ScrollProgress_scrollProgress_bar__45J4L" />
    </div>
  );
}
