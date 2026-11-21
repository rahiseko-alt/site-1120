"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  useAppStore,
  useAssetsStore,
  useThreeProgressStore,
} from "@/stores/appStore";
import { usePageLeave } from "@/hooks/usePageLifecycle";
import { ASSETS_TIMEOUT, DURATION } from "@/lib/constants";
import { GifPlayer } from "@/components/common/GifPlayer";

gsap.registerPlugin(useGSAP);

function isThreeReady() {
  const { progress, active, total } = useThreeProgressStore.getState();
  return progress >= 100 || (total === 0 && !active);
}

export function PageLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const quickProgressRef = useRef<gsap.QuickToFunc | null>(null);
  const doneRef = useRef(false);
  const helloRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLParagraphElement>(null);
  const gifLoadedRef = useRef(false);
  const progressValRef = useRef({ value: 0 });
  const pathname = usePathname();

  useEffect(() => {
    if (!useAppStore.getState().routerState.pathName) {
      useAppStore.getState().setPathName(pathname);
    }
    useAssetsStore.getState().registerAssets();
    const t = setTimeout(
      () => useAssetsStore.getState().unRegisterAssets(),
      ASSETS_TIMEOUT
    );
    return () => {
      useAssetsStore.getState().unRegisterAssets();
      clearTimeout(t);
    };
  }, [pathname]);

  usePageLeave(() => {
    if (useAppStore.getState().routerState.pathName !== pathname) {
      useAssetsStore.getState().resetAssets();
    }
  });

  const { contextSafe } = useGSAP(() => {
    quickProgressRef.current = gsap.quickTo(progressValRef.current, "value", {
      duration: DURATION.FAST,
      ease: "power3.inOut",
      onUpdate: () => {
        if (barRef.current && pctRef.current) {
          barRef.current.style.setProperty(
            "--progress",
            `${progressValRef.current.value.toFixed(2)}%`
          );
          pctRef.current.textContent = `${Math.round(progressValRef.current.value)}%`;
          if (progressValRef.current.value >= 100) {
            revealPage();
          }
        }
      },
    });
  });

  const revealPage = useCallback(
    contextSafe(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      gsap.to(barRef.current, {
        scaleX: 0,
        transformOrigin: "center center",
        ease: "power3.inOut",
      });
      gsap.to(contentRef.current, {
        opacity: 0,
        delay: 0.3,
        duration: 0.3,
        ease: "power3.inOut",
      });
      setTimeout(() => {
        useAppStore.getState().setPlayVideo();
      }, 150);
      gsap.to(loaderRef.current, {
        "--page-loader-mask-height": "100%",
        duration: DURATION.NORMAL,
        ease: "power3.out",
        delay: 0.4,
        onComplete: () => {
          gsap.set(loaderRef.current, {
            visibility: "hidden",
            pointerEvents: "none",
          });
          useAppStore.getState().pagePlay();
          setTimeout(useAppStore.getState().pageEnter, 100);
        },
      });
    }),
    []
  );

  useEffect(() => {
    const unsub1 = useAssetsStore.subscribe((state) => {
      if (doneRef.current) return;
      if (state.assetsProgress >= 100) {
        if (isThreeReady() && gifLoadedRef.current) {
          quickProgressRef.current?.(100);
        }
      } else {
        const next = Math.max(
          Math.max(35, state.assetsProgress),
          progressValRef.current.value
        );
        if (gifLoadedRef.current) quickProgressRef.current?.(next);
      }
    });

    const unsub2 = useThreeProgressStore.subscribe((state) => {
      if (doneRef.current) return;
      if (state.progress >= 100 || (state.total === 0 && !state.active)) {
        if (useAssetsStore.getState().assetsProgress >= 100 && gifLoadedRef.current) {
          quickProgressRef.current?.(100);
        }
      } else {
        const next = Math.max(
          Math.max(35, useAssetsStore.getState().assetsProgress),
          progressValRef.current.value
        );
        if (gifLoadedRef.current) quickProgressRef.current?.(next);
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      if (!doneRef.current) {
        quickProgressRef.current?.(100);
        revealPage();
      }
    }, 8000);
    return () => window.clearTimeout(fallback);
  }, [revealPage]);

  const handleGifLoad = useCallback(() => {
    gsap.to(helloRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
    gsap.to(contentRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      delay: 0.3,
      onComplete: () => {
        gifLoadedRef.current = true;
        if (useAssetsStore.getState().assetsProgress >= 100 && isThreeReady()) {
          quickProgressRef.current?.(100);
        } else {
          quickProgressRef.current?.(35);
          // Progress smoothly to 100
          setTimeout(() => {
            quickProgressRef.current?.(70);
            setTimeout(() => {
              quickProgressRef.current?.(100);
            }, 600);
          }, 600);
        }
      },
    });
  }, []);

  return (
    <div ref={loaderRef} className="PageLoader_pageLoader___1cgC">
      <p className="PageLoader_pageLoader_hello__zroZn" ref={helloRef}>
        Hello, welcome to fromanother!
      </p>
      <div ref={contentRef} className="PageLoader_pageLoader_content__g4G3o">
        <div className="PageLoader_pageLoader_gif__S2PNJ">
          <GifPlayer
            src="/images/loading.gif"
            className="PageLoader_pageLoader_gifImg__D7UIb"
            onLoad={handleGifLoad}
          />
        </div>
        <div className="PageLoader_pageLoader_percentage__d3Dk1">
          <p ref={pctRef}>0%</p>
        </div>
        <div className="PageLoader_pageLoader_progress__tTGIF">
          <div ref={barRef} className="PageLoader_pageLoader_progress_bar__gQsNW" />
        </div>
      </div>
    </div>
  );
}
