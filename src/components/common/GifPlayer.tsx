"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { parseGIF, decompressFrames, ParsedFrame } from "gifuct-js";

interface GifPlayerProps {
  src: string;
  onLoad?: () => void;
  className?: string;
  playing?: boolean;
  speedMultiplier?: number;
  reverse?: boolean;
  interactiveMouse?: boolean;
  tintColor?: string;
}

export function GifPlayer({
  src,
  onLoad,
  className,
  playing = true,
  speedMultiplier = 1,
  reverse = false,
  interactiveMouse = false,
  tintColor,
}: GifPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const framesRef = useRef<ParsedFrame[]>([]);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const frameIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const compCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mainCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const needsClearRef = useRef(false);
  const isLoadedRef = useRef(false);
  const dynamicSpeedRef = useRef(speedMultiplier);
  const dynamicReverseRef = useRef(reverse);

  useEffect(() => {
    dynamicSpeedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    dynamicReverseRef.current = reverse;
  }, [reverse]);

  useEffect(() => {
    if (!interactiveMouse) return;
    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const boost = Math.min(3.5, 1 + Math.abs(dx) * 0.06);
      dynamicSpeedRef.current = boost;
      if (Math.abs(dx) > 4) {
        dynamicReverseRef.current = dx < 0;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactiveMouse]);

  const drawPatch = useCallback((frame: ParsedFrame) => {
    const mainCanvas = canvasRef.current;
    const compCtx = compCtxRef.current;
    if (!mainCanvas || !compCtx || !compCanvasRef.current) return;

    const dims = frame.dims;
    let tempCanvas = tempCanvasRef.current;
    if (!tempCanvas) {
      tempCanvas = document.createElement("canvas");
      tempCanvasRef.current = tempCanvas;
      tempCtxRef.current = tempCanvas.getContext("2d");
    }
    const tempCtx = tempCtxRef.current;
    if (!tempCtx) return;

    tempCanvas.width = dims.width;
    tempCanvas.height = dims.height;

    const imgData = tempCtx.createImageData(dims.width, dims.height);
    imgData.data.set(frame.patch);
    tempCtx.putImageData(imgData, 0, 0);

    compCtx.drawImage(tempCanvas, dims.left, dims.top);

    if (!mainCtxRef.current) {
      mainCtxRef.current = mainCanvas.getContext("2d");
    }
    const mainCtx = mainCtxRef.current;
    if (mainCtx) {
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.drawImage(
        compCanvasRef.current,
        0,
        0,
        mainCanvas.width,
        mainCanvas.height,
        0,
        0,
        mainCanvas.width,
        mainCanvas.height
      );
      if (tintColor) {
        mainCtx.save();
        mainCtx.globalCompositeOperation = "source-atop";
        mainCtx.fillStyle = tintColor;
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.restore();
      }
    }
  }, [tintColor]);

  const renderNextFrame = useCallback(() => {
    const frames = framesRef.current;
    if (frames.length === 0) return;

    if (needsClearRef.current && compCtxRef.current) {
      compCtxRef.current.clearRect(0, 0, widthRef.current, heightRef.current);
      needsClearRef.current = false;
    }

    const idx = frameIndexRef.current;
    const frame = frames[idx];
    drawPatch(frame);
    needsClearRef.current = frame.disposalType === 2;
    const step = dynamicReverseRef.current ? -1 : 1;
    frameIndexRef.current = (idx + step + frames.length) % frames.length;
    const nextFrame = frames[frameIndexRef.current];

    if (playing && nextFrame) {
      const spd = Math.max(0.25, dynamicSpeedRef.current);
      timerRef.current = setTimeout(
        renderNextFrame,
        Math.max(8, (nextFrame.delay ?? 50) / spd)
      );
    }
  }, [drawPatch, playing]);

  useEffect(() => {
    let canceled = false;
    setError(null);

    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        if (canceled) return;
        const gif = parseGIF(buffer);
        const frames = decompressFrames(gif, true);
        if (frames.length === 0) {
          setError("No frames");
          return;
        }

        framesRef.current = frames;
        widthRef.current = gif.lsd.width;
        heightRef.current = gif.lsd.height;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = gif.lsd.width;
        canvas.height = gif.lsd.height;

        const compCanvas = document.createElement("canvas");
        compCanvas.width = gif.lsd.width;
        compCanvas.height = gif.lsd.height;
        compCanvasRef.current = compCanvas;
        compCtxRef.current = compCanvas.getContext("2d");

        frameIndexRef.current = 0;
        isLoadedRef.current = true;
        drawPatch(frames[0]);
        onLoad?.();

        if (playing && frames.length > 1) {
          frameIndexRef.current = 1;
          timerRef.current = setTimeout(
            renderNextFrame,
            Math.max(10, frames[0].delay ?? 50)
          );
        }
      })
      .catch((err) => {
        if (!canceled) {
          setError(err?.message ?? "Failed to load GIF");
        }
      });

    return () => {
      canceled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [src, onLoad, drawPatch, renderNextFrame, playing]);

  useEffect(() => {
    if (isLoadedRef.current && framesRef.current.length > 0) {
      if (playing && !timerRef.current) {
        frameIndexRef.current = 0;
        renderNextFrame();
      } else if (!playing && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        framesRef.current = [];
        tempCanvasRef.current = null;
        tempCtxRef.current = null;
        compCanvasRef.current = null;
        compCtxRef.current = null;
      }
    }
  }, [playing, renderNextFrame]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      framesRef.current = [];
      tempCanvasRef.current = null;
      tempCtxRef.current = null;
      compCanvasRef.current = null;
      compCtxRef.current = null;
      mainCtxRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className={className} style={{ background: "#eee", minHeight: 100 }}>
        Failed to load GIF
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
}
