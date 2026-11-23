"use client";

import React, { useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const descriptionsRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const lastIdxRef = useRef(-1);

  const totalMembers = members.length || 1;

  useEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content || totalMembers <= 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        content.style.setProperty("--progress", self.progress.toFixed(4));

        // Update 3D orbital fan trajectory of cards directly on DOM
        if (cardsWrapRef.current) {
          const cardEls = cardsWrapRef.current.children;
          const activeFloat = self.progress * (totalMembers - 1);
          for (let i = 0; i < cardEls.length; i++) {
            const card = cardEls[i] as HTMLElement;
            const rel = i - activeFloat;
            const tx = rel * 75;
            const ty = Math.abs(rel) * 18 + rel * -12;
            const rot = rel * 9;
            const sc = Math.max(0.75, 1 - Math.abs(rel) * 0.14);
            const op = Math.max(0, 1 - Math.abs(rel) * 0.55);
            card.style.transform = `translate3d(${tx}%, ${ty}%, 0) rotate(${rot}deg) scale(${sc})`;
            card.style.opacity = op.toFixed(3);
            card.style.zIndex = `${Math.round(100 - Math.abs(rel) * 20)}`;
          }
        }

        const idx = Math.max(
          0,
          Math.min(totalMembers - 1, Math.floor(self.progress * totalMembers))
        );

        if (idx !== lastIdxRef.current) {
          lastIdxRef.current = idx;
          if (counterRef.current) {
            counterRef.current.textContent = (idx + 1).toString().padStart(2, "0");
          }
          if (descriptionsRef.current) {
            const items = descriptionsRef.current.children;
            for (let i = 0; i < items.length; i++) {
              const item = items[i] as HTMLElement;
              if (i === idx) {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
                item.style.filter = "blur(0px)";
                item.style.pointerEvents = "auto";
              } else {
                item.style.opacity = "0";
                item.style.transform = "translateY(16px)";
                item.style.filter = "blur(6px)";
                item.style.pointerEvents = "none";
              }
            }
          }
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [totalMembers]);

  return (
    <>
      {/* Full Screen Media Statement: Asymmetric Editorial Split */}
      <div
        className="Team_fullScreenMedia__yjo7P"
        style={{
          position: "relative",
          width: "100%",
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "14rem var(--padding-x) 6rem",
          color: "var(--brand-yellow)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(242, 239, 233, 0.2)",
            paddingBottom: "2rem",
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-accent)",
            }}
          >
            05 // The Collective Ethos
          </span>
          <span
            style={{
              fontFamily: "var(--font-herbik)",
              fontStyle: "italic",
              fontSize: "1.5rem",
              opacity: 0.75,
            }}
          >
            Leadership &amp; Craft across 4 Timezones
          </span>
        </div>

        <div
          style={{
            fontSize: "clamp(4.4rem, 7.6vw, 11.2rem)",
            fontWeight: 600,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            maxWidth: "95rem",
            alignSelf: "flex-end",
            textAlign: "right",
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
          ref={contentRef}
          className="Team_team_content__Qae2s"
          style={
            {
              "--total-items": totalMembers,
              "--progress": "0",
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
            } as React.CSSProperties
          }
        >
          {/* Huge Number Top-Right */}
          <div
            ref={counterRef}
            style={{
              position: "absolute",
              top: "10rem",
              right: "calc(var(--padding-x) + 12rem)",
              fontSize: "clamp(8rem, 13vw, 19rem)",
              fontWeight: 700,
              lineHeight: 0.85,
              color: "var(--brand-yellow)",
              opacity: 0.9,
              fontFamily: "var(--font-twk)",
              letterSpacing: "-0.05em",
              pointerEvents: "none",
            }}
          >
            01
          </div>

          {/* Right-Offset 3D Orbital Card Stack */}
          <div
            ref={cardsWrapRef}
            style={{
              position: "relative",
              width: "clamp(280px, 32vw, 480px)",
              aspectRatio: "1222/1333",
              marginLeft: "18vw",
            }}
          >
            {members.map((m, idx) => (
              <div
                key={m.id || idx}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "0.4rem",
                  overflow: "hidden",
                  boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(242, 239, 233, 0.14)",
                  transform:
                    idx === 0
                      ? "translate3d(0%, 0%, 0) rotate(0deg) scale(1)"
                      : `translate3d(${idx * 75}%, ${idx * 6}%, 0) rotate(${idx * 9}deg) scale(0.86)`,
                  opacity: idx === 0 ? 1 : Math.max(0, 1 - idx * 0.55),
                  zIndex: 100 - idx * 20,
                  willChange: "transform, opacity",
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
            ))}
          </div>

          {/* Description Text Bottom-Left Editorial Column */}
          <div
            ref={descriptionsRef}
            style={{
              position: "absolute",
              bottom: "7rem",
              left: "var(--padding-x)",
              maxWidth: "44rem",
              textAlign: "left",
              color: "var(--brand-yellow)",
              pointerEvents: "none",
              zIndex: 110,
            }}
          >
            {members.map((m, idx) => (
              <div
                key={m.id || idx}
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  opacity: idx === 0 ? 1 : 0,
                  transform: idx === 0 ? "translateY(0)" : "translateY(16px)",
                  filter: idx === 0 ? "blur(0px)" : "blur(6px)",
                  transition: "all 0.5s ease",
                  fontSize: "clamp(1.6rem, 1.9vw, 2.3rem)",
                  lineHeight: 1.4,
                  fontWeight: 400,
                  borderLeft: "2px solid var(--brand-accent)",
                  paddingLeft: "2.4rem",
                }}
              >
                {m.data?.description && (
                  <PrismicRichText field={m.data.description} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
