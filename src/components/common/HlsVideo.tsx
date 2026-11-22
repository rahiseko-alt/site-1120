"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useAssetsStore, useAppStore } from "@/stores/appStore";

interface HlsVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  ref?: React.Ref<HTMLVideoElement | null>;
  playing?: boolean;
  onVideoReady?: (el: HTMLVideoElement) => void;
}

export function HlsVideo({
  src,
  poster,
  ref,
  playing = true,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  controls = false,
  onVideoReady,
  ...rest
}: HlsVideoProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const registeredRef = useRef(false);
  const playVideoFromStore = useAppStore((s) => s.playVideo);

  const setRefs = (el: HTMLVideoElement | null) => {
    internalRef.current = el;
    if (el) {
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
    }
    if (typeof ref === "function") ref(el);
    else if (ref && typeof ref === "object") {
      (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    }
  };

  useEffect(() => {
    const video = internalRef.current;
    if (!video || !src) return;

    video.muted = true;
    video.defaultMuted = true;

    const resolvedSrc = src.includes(".mux.com")
      ? `/api/mux?url=${encodeURIComponent(src)}`
      : src;

    let hls: Hls | null = null;
    const finishLoad = () => {
      if (registeredRef.current) {
        registeredRef.current = false;
        useAssetsStore.getState().unRegisterAssets();
      }
      onVideoReady?.(video);
    };

    registeredRef.current = true;
    useAssetsStore.getState().registerAssets();

    const tryPlay = () => {
      if (playing) {
        video.play().catch(() => {});
      }
    };

    if (src.includes(".m3u8")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = resolvedSrc;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      } else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, maxBufferLength: 10 });
        hls.loadSource(resolvedSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          tryPlay();
          finishLoad();
        });
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) finishLoad();
        });
      }
    } else {
      video.src = src;
    }

    const onLoadedData = () => {
      tryPlay();
      finishLoad();
    };
    const onError = () => finishLoad();
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
      if (hls) hls.destroy();
      if (registeredRef.current) {
        registeredRef.current = false;
        useAssetsStore.getState().unRegisterAssets();
      }
    };
  }, [src, onVideoReady]);

  // Pause or play based on active visibility and store state
  useEffect(() => {
    const video = internalRef.current;
    if (!video) return;
    if (playing) {
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [playing, playVideoFromStore]);

  return (
    <video
      ref={setRefs}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      preload="metadata"
      {...rest}
    />
  );
}
