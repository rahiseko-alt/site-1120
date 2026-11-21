"use client";

import React, { useRef } from "react";
import { useSectionStore } from "@/stores/appStore";
import { HlsVideo } from "@/components/common/HlsVideo";

interface MediaPair {
  videoUrl?: string;
  posterUrl?: string;
}

export function BackgroundTransition({
  backgroundMedia,
}: {
  backgroundMedia: {
    hero?: MediaPair;
    about?: MediaPair;
    whatWeDo?: MediaPair;
    fullScreenMedia?: MediaPair;
    collaborations?: MediaPair;
    footer?: MediaPair;
  };
}) {
  const sectionIdx = useSectionStore((s) => s.currentSectionIndex);
  const wrapRef = useRef<HTMLDivElement>(null);

  const showCreamBg = sectionIdx === 3 || sectionIdx === 6;

  return (
    <div
      ref={wrapRef}
      className="BackgroundTransition_backgroundTransition__uwn48"
      style={{
        position: "sticky",
        top: 0,
        height: "100lvh",
        zIndex: 0,
        backgroundColor: showCreamBg ? "#fffde2" : "#051236",
        transition: "background-color 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)",
      }}
    >
      {backgroundMedia.hero?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx <= 0 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.hero.videoUrl}
            poster={backgroundMedia.hero.posterUrl}
            playing={sectionIdx <= 0}
          />
        </div>
      )}

      {backgroundMedia.about?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx === 1 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.about.videoUrl}
            poster={backgroundMedia.about.posterUrl}
            playing={sectionIdx === 1}
          />
        </div>
      )}

      {backgroundMedia.whatWeDo?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx === 2 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.whatWeDo.videoUrl}
            poster={backgroundMedia.whatWeDo.posterUrl}
            playing={sectionIdx === 2}
          />
        </div>
      )}

      {backgroundMedia.fullScreenMedia?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx === 4 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.fullScreenMedia.videoUrl}
            poster={backgroundMedia.fullScreenMedia.posterUrl}
            playing={sectionIdx === 4}
          />
        </div>
      )}

      {backgroundMedia.collaborations?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx === 5 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.collaborations.videoUrl}
            poster={backgroundMedia.collaborations.posterUrl}
            playing={sectionIdx === 5}
          />
        </div>
      )}

      {backgroundMedia.footer?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__2_m2F"
          style={{
            opacity: sectionIdx >= 7 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.8s ease",
          }}
        >
          <HlsVideo
            src={backgroundMedia.footer.videoUrl}
            poster={backgroundMedia.footer.posterUrl}
            playing={sectionIdx >= 7}
          />
        </div>
      )}
    </div>
  );
}
