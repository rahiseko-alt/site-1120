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

  return (
    <div
      ref={wrapRef}
      className="BackgroundTransition_backgroundTransition__uwn48"
    >
      {/* 0: Hero Video Layer */}
      {backgroundMedia.hero?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx <= 0 ? 1 : 0,
            visibility: sectionIdx <= 1 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.hero.videoUrl}
              poster={backgroundMedia.hero.posterUrl}
              playing={sectionIdx <= 0}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 1: About Video Layer */}
      {backgroundMedia.about?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 1 ? 1 : 0,
            visibility: sectionIdx >= 0 && sectionIdx <= 2 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.about.videoUrl}
              poster={backgroundMedia.about.posterUrl}
              playing={sectionIdx === 1}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 2: What We Do Video Layer */}
      {backgroundMedia.whatWeDo?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 2 ? 1 : 0,
            visibility: sectionIdx >= 1 && sectionIdx <= 3 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.whatWeDo.videoUrl}
              poster={backgroundMedia.whatWeDo.posterUrl}
              playing={sectionIdx === 2}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 3: Showcase Section Color Background */}
      <div
        className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy BackgroundTransition_backgroundTransition_videoWrapper__showcase__mL_M_"
        style={{
          opacity: sectionIdx === 3 ? 1 : 0,
          visibility: sectionIdx === 3 ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      />

      {/* 4: Full Screen Media (Driven by Creative Curiosity) */}
      {backgroundMedia.fullScreenMedia?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 4 ? 1 : 0,
            visibility: sectionIdx >= 3 && sectionIdx <= 5 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.fullScreenMedia.videoUrl}
              poster={backgroundMedia.fullScreenMedia.posterUrl}
              playing={sectionIdx === 4}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 5: Collaborations Video Layer */}
      {backgroundMedia.collaborations?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 5 ? 1 : 0,
            visibility: sectionIdx >= 4 && sectionIdx <= 6 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.collaborations.videoUrl}
              poster={backgroundMedia.collaborations.posterUrl}
              playing={sectionIdx === 5}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 6: Team Section Color Background */}
      <div
        className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy BackgroundTransition_backgroundTransition_videoWrapper__team__3znuA"
        style={{
          opacity: sectionIdx === 6 ? 1 : 0,
          visibility: sectionIdx === 6 ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      />

      {/* 7: Footer Video Layer */}
      {backgroundMedia.footer?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy BackgroundTransition_backgroundTransition_videoWrapper__footer__z_qDl"
          style={{
            opacity: sectionIdx >= 7 ? 1 : 0,
            visibility: sectionIdx >= 6 ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.footer.videoUrl}
              poster={backgroundMedia.footer.posterUrl}
              playing={sectionIdx >= 7}
            />
          </div>
          <div
            className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
