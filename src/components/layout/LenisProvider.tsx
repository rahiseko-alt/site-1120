"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

interface LenisContextValue {
  __lenis: Lenis | null;
  onScroll: (cb: (e: Lenis) => void) => () => void;
}

const LenisContext = createContext<LenisContextValue>({
  __lenis: null,
  onScroll: () => () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const listenersRef = useRef<Set<(e: Lenis) => void>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenisInstance(lenis);
    document.documentElement.classList.add("js-smooth-scrollbar-enabled");

    const onScrollHandler = (e: Lenis) => {
      ScrollTrigger.update();
      listenersRef.current.forEach((cb) => cb(e));
    };

    lenis.on("scroll", onScrollHandler);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScrollHandler);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    }
  }, [pathname, lenisInstance]);

  const onScroll = useCallback((cb: (e: Lenis) => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  return (
    <LenisContext.Provider value={{ __lenis: lenisInstance, onScroll }}>
      {children}
    </LenisContext.Provider>
  );
}
