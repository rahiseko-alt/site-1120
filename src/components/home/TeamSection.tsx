"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";

gsap.registerPlugin(ScrollTrigger);

interface MemberItem {
  id?: string;
  data?: {
    avatar?: { url?: string; alt?: string };
    description?: RichTextField;
    full_name?: string;
    role?: string;
  };
}

interface TeamSectionProps {
  reelTitle?: RichTextField;
  members: MemberItem[];
}

export function TeamSection({ reelTitle, members }: TeamSectionProps) {
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalMembers = members.length || 1;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || totalMembers <= 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        const idx = Math.max(
          0,
          Math.min(totalMembers - 1, Math.floor(self.progress * totalMembers))
        );
        setCurrentIdx(idx);
      },
    });

    return () => {
      st.kill();
    };
  }, [totalMembers]);

  const currentMember = members[currentIdx];

  return (
    <>
      {/* Full Screen Media: Driven by Creative Curiosity */}
      <div
        className="Team_fullScreenMedia__yjo7P"
        style={{
          position: "relative",
          width: "100%",
          height: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--brand-yellow)",
          zIndex: 2,
        }}
      >
        <div
          className="Team_fullScreenMedia_title__VTsHD"
          style={{
            fontSize: "clamp(4.8rem, 8vw, 11rem)",
            fontWeight: 600,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            whiteSpace: "pre-line",
          }}
        >
          {reelTitle ? (
            <PrismicRichText field={reelTitle} />
          ) : (
            <h2>
              Driven by<br />Creative Curiosity
            </h2>
          )}
        </div>
      </div>

      {/* Team Pinned Sequence: 01, 02, 03... */}
      <div
        ref={containerRef}
        className="Team_team__zUqci"
        style={{
          position: "relative",
          width: "100%",
          height: `calc(${totalMembers} * 100svh)`,
          display: "block",
        }}
      >
        <div
          className="Team_team_content__Qae2s"
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100svh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            color: "var(--brand-yellow)",
          }}
        >
          {/* Section Indicator */}
          <div
            className="Team_team_content_index__SwTCp"
            style={{
              position: "absolute",
              top: "var(--padding-x)",
              left: "var(--padding-x)",
              fontSize: "1.4rem",
              fontFamily: "var(--font-herbik)",
              fontStyle: "italic",
              opacity: 0.8,
            }}
          >
            <p>4 — Our team</p>
          </div>

          {/* Center Card Stack */}
          <div
            className="Team_team_cards__SKPWf"
            style={
              {
                "--total-items": totalMembers,
                position: "relative",
                width: "clamp(300px, 35vw, 520px)",
                aspectRatio: "1222/1333",
              } as React.CSSProperties
            }
          >
            {members.map((m, idx) => {
              const relPos = idx - progress * (totalMembers - 1);
              const isActive = Math.abs(relPos) < 0.6;
              const opacity = Math.max(0, 1 - Math.abs(relPos) * 0.9);
              // Shift cards diagonally/horizontally as scroll progresses
              const offsetX = relPos * 105;
              const offsetY = relPos * 8;

              return (
                <div
                  key={m.id || idx}
                  className="Team_team_cards_item__GcozS"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity,
                    transform: `translate3d(${offsetX}%, ${offsetY}%, 0) scale(${isActive ? 1 : 0.88})`,
                    transition: "transform 0.15s ease-out, opacity 0.2s ease-out",
                    borderRadius: "0.2rem",
                    overflow: "hidden",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  {m.data?.avatar?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.data.avatar.url}
                      alt={m.data.avatar.alt || ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Info layer: Huge counter + Description */}
          <div
            className="Team_team_info__5Pfba"
            style={{
              display: "block",
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            {/* Huge Number Bottom-Left */}
            <div
              className="Team_team_info_counter__REPrS"
              style={{
                position: "absolute",
                bottom: "4rem",
                left: "var(--padding-x)",
                fontSize: "clamp(8rem, 14vw, 20rem)",
                fontWeight: 700,
                lineHeight: 0.9,
                color: "var(--brand-yellow)",
                opacity: 0.9,
                fontFamily: "var(--font-twk)",
              }}
            >
              {(currentIdx + 1).toString().padStart(2, "0")}
            </div>

            {/* Description Text Right Side */}
            <div
              className="Team_team_info_descriptions__Tq1DR"
              style={{
                position: "absolute",
                top: "50%",
                right: "var(--padding-x)",
                transform: "translateY(-50%)",
                maxWidth: "36rem",
                textAlign: "left",
                color: "var(--brand-yellow)",
              }}
            >
              {members.map((m, idx) => {
                const isActive = idx === currentIdx;
                return (
                  <div
                    key={m.id || idx}
                    className="Team_team_info_descriptions_item__3ENup"
                    style={{
                      position: idx === 0 ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? "translateY(0)"
                        : "translateY(16px)",
                      filter: isActive ? "blur(0px)" : "blur(6px)",
                      transition: "all 0.5s ease",
                      fontSize: "clamp(1.5rem, 1.8vw, 2.2rem)",
                      lineHeight: 1.4,
                      fontWeight: 400,
                    }}
                  >
                    {m.data?.description && (
                      <PrismicRichText field={m.data.description} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
