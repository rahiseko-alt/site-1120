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
  const contentRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const readyToTrackRef = useRef(false);
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
        const val = progressValRef.current.value;
        if (barRef.current && pctRef.current) {
          barRef.current.style.setProperty("--progress", `${(val / 100).toFixed(4)}`);
          pctRef.current.textContent = Math.round(val).toString().padStart(3, "0");
          if (ringRef.current) {
            const circumference = 2 * Math.PI * 54;
            ringRef.current.style.strokeDashoffset = `${circumference * (1 - val / 100)}`;
          }
          if (val >= 99.8) {
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
        transformOrigin: "right center",
        ease: "power3.inOut",
      });
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -24,
        delay: 0.15,
        duration: 0.45,
        ease: "power3.inOut",
      });
      setTimeout(() => {
        useAppStore.getState().setPlayVideo();
      }, 100);
      gsap.to(loaderRef.current, {
        "--page-loader-mask-height": "100%",
        duration: DURATION.NORMAL,
        ease: "power4.inOut",
        delay: 0.3,
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
    const initTimer = setTimeout(() => {
      readyToTrackRef.current = true;
      if (useAssetsStore.getState().assetsProgress >= 100 && isThreeReady()) {
        quickProgressRef.current?.(100);
      } else {
        quickProgressRef.current?.(60);
        setTimeout(() => {
          quickProgressRef.current?.(100);
        }, 280);
      }
    }, 120);

    const unsub1 = useAssetsStore.subscribe((state) => {
      if (doneRef.current || !readyToTrackRef.current) return;
      if (state.assetsProgress >= 100 && isThreeReady()) {
        quickProgressRef.current?.(100);
      } else {
        const next = Math.max(Math.max(42, state.assetsProgress), progressValRef.current.value);
        quickProgressRef.current?.(next);
      }
    });

    const unsub2 = useThreeProgressStore.subscribe((state) => {
      if (doneRef.current || !readyToTrackRef.current) return;
      if (
        (state.progress >= 100 || (state.total === 0 && !state.active)) &&
        useAssetsStore.getState().assetsProgress >= 100
      ) {
        quickProgressRef.current?.(100);
      }
    });

    return () => {
      clearTimeout(initTimer);
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
    }, 5500);
    return () => window.clearTimeout(fallback);
  }, [revealPage]);

  return (
    <div
      ref={loaderRef}
      className="PageLoader_pageLoader___1cgC"
      style={{
        background: "var(--brand-dark-blue)",
        color: "var(--brand-yellow)",
        borderBottom: "1px solid rgba(242, 239, 233, 0.15)",
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "4.8rem var(--padding-x)",
          pointerEvents: "none",
        }}
      >
        {/* Top Metadata Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.2rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.65,
          }}
        >
          <span>ATELIER // MULTIDISCIPLINARY PRACTICE</span>
          <span style={{ fontFamily: "var(--font-herbik)", fontStyle: "italic", textTransform: "none" }}>
            Saigon · Hong Kong · Tokyo · Paris
          </span>
        </div>

        {/* Center Geometric Dial & Kinetic Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            margin: "auto 0",
          }}
        >
          <div style={{ position: "relative", width: "12rem", height: "12rem" }}>
            <svg
              viewBox="0 0 120 120"
              style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(242, 239, 233, 0.12)"
                strokeWidth="1"
              />
              <circle
                ref={ringRef}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--brand-accent)"
                strokeWidth="2"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54}
                style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              Init
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "1.2rem",
              fontFamily: "var(--font-twk)",
              fontWeight: 600,
              fontSize: "clamp(7.2rem, 15vw, 22rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span ref={pctRef}>000</span>
            <span
              style={{
                fontSize: "clamp(2rem, 3.5vw, 4.8rem)",
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--brand-accent)",
              }}
            >
              %
            </span>
          </div>
        </div>

        {/* Bottom Hairline Progress */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(242, 239, 233, 0.14)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              ref={barRef}
              className="PageLoader_pageLoader_progress_bar__gQsNW"
              style={{
                background: "var(--brand-yellow)",
                width: "100%",
                height: "100%",
                transformOrigin: "left center",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.1rem",
              opacity: 0.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>Loading WebGL Shaders &amp; Streams</span>
            <span>Edition 2026 — 2027</span>
          </div>
        </div>
      </div>
    </div>
  );
}
