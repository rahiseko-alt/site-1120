"use client";

import React, { useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

export interface HoverTextHandle {
  onHover: (vars?: gsap.TweenVars) => void;
  motionIn: (vars?: gsap.TweenVars) => void;
  motionOut: (vars?: gsap.TweenVars) => void;
  slide: (vars?: gsap.TweenVars) => void;
}

interface HoverTextProps {
  ref?: React.Ref<HoverTextHandle>;
  children: React.ReactNode;
  fixClip?: boolean;
  withInit?: boolean;
}

export function HoverText({ ref, children, fixClip, withInit }: HoverTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    onHover: (vars?: gsap.TweenVars) => {
      if (!wrapRef.current) return;
      const t = wrapRef.current.querySelector(".text");
      const clone = wrapRef.current.querySelector(".text__clone");
      gsap.fromTo(
        t,
        { yPercent: 0 },
        { yPercent: -100, ease: "power3.out", duration: 0.7, ...vars }
      );
      gsap.fromTo(
        clone,
        { yPercent: 100 },
        { yPercent: 0, ease: "power3.out", duration: 0.7, ...vars }
      );
    },
    motionIn: (vars?: gsap.TweenVars) => {
      if (!wrapRef.current) return;
      const t = wrapRef.current.querySelector(".text");
      const clone = wrapRef.current.querySelector(".text__clone");
      gsap.to(t, { yPercent: -100, ease: "power3.out", duration: 0.7, ...vars });
      gsap.to(clone, { yPercent: 0, ease: "power3.out", duration: 0.7, ...vars });
    },
    motionOut: (vars?: gsap.TweenVars) => {
      if (!wrapRef.current) return;
      const t = wrapRef.current.querySelector(".text");
      const clone = wrapRef.current.querySelector(".text__clone");
      gsap.to(t, { yPercent: 0, ease: "power3.out", duration: 0.7, ...vars });
      gsap.to(clone, { yPercent: 100, ease: "power3.out", duration: 0.7, ...vars });
    },
    slide: (vars?: gsap.TweenVars) => {
      if (!wrapRef.current || !withInit) return;
      const t = wrapRef.current.querySelector(".text");
      const clone = wrapRef.current.querySelector(".text__clone");
      gsap.fromTo(
        t,
        { yPercent: 100 },
        { yPercent: 0, ease: "power3.out", duration: 0.7, ...vars }
      );
      gsap.to(clone, { yPercent: 100, ease: "power3.out", duration: 0.7, ...vars });
    },
  }));

  useEffect(() => {
    if (!wrapRef.current) return;
    if (withInit) {
      const t = wrapRef.current.querySelector(".text");
      gsap.set(t, { yPercent: 100 });
    }
    const clone = wrapRef.current.querySelector(".text__clone");
    gsap.set(clone, { yPercent: 100 });
  }, [withInit]);

  return (
    <span
      style={{ display: "block", overflow: "clip" }}
      className={fixClip ? "fix-mask-clip-mask" : ""}
    >
      <span
        ref={wrapRef}
        className="will-change-transform"
        style={{ display: "block", position: "relative" }}
      >
        <span className="text" style={{ display: "block", willChange: "auto" }}>
          {children}
        </span>
        <span
          className="text__clone"
          style={{
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "auto",
          }}
        >
          {children}
        </span>
      </span>
    </span>
  );
}
