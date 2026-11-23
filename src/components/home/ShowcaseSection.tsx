"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShowcaseCanvas } from "@/components/home/ShowcaseCanvas";
import { TransitionLink } from "@/components/common/TransitionLink";
import { useRouterTransition } from "@/hooks/usePageLifecycle";
import { ROUTES } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

interface ProjectItem {
  uid?: string;
  data?: {
    name?: string;
    card_thumbnail?: { url?: string };
    small_card_thumbnail?: { url?: string };
    services_provided?: Array<{ service?: string }>;
  };
}

interface ShowcaseSectionProps {
  projects: ProjectItem[];
  viewAllLabel?: string;
}

export function ShowcaseSection({ projects, viewAllLabel }: ShowcaseSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const lastIdxRef = useRef(-1);
  const { routerPrefetch } = useRouterTransition();

  const totalItems = projects.length || 1;

  const imageUrls = useMemo(
    () =>
      projects.map(
        (p) => p.data?.card_thumbnail?.url || "/images/test.jpg"
      ),
    [projects]
  );

  const activeProject = projects[activeIndex];

  useEffect(() => {
    const el = containerRef.current;
    if (!el || totalItems <= 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.max(
          0,
          Math.min(totalItems - 1, Math.floor(self.progress * totalItems))
        );

        if (idx !== lastIdxRef.current) {
          lastIdxRef.current = idx;
          setActiveIndex(idx);

          if (counterRef.current) {
            counterRef.current.textContent = `0${idx + 1} / 0${totalItems}`;
          }

          if (namesRef.current) {
            const children = namesRef.current.children;
            for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              const isActive = i === idx;
              child.style.opacity = isActive ? "1" : "0";
              child.style.transform = isActive ? "translateY(0)" : "translateY(24px)";
              child.style.filter = isActive ? "blur(0px)" : "blur(10px)";
              child.style.pointerEvents = isActive ? "auto" : "none";
            }
          }

          if (servicesRef.current) {
            const children = servicesRef.current.children;
            for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              const isActive = i === idx;
              child.style.opacity = isActive ? "1" : "0";
              child.style.transform = isActive ? "translateY(0)" : "translateY(10px)";
              child.style.filter = isActive ? "blur(0px)" : "blur(4px)";
              child.style.display = isActive ? "flex" : "none";
            }
          }

          if (slidesRef.current) {
            const children = slidesRef.current.children;
            for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              const isActive = i === idx;
              child.style.opacity = isActive ? "1" : "0.35";
              child.style.transform = isActive ? "scale(1.1)" : "scale(1)";
              child.style.borderColor = isActive
                ? "var(--brand-accent)"
                : "transparent";
            }
          }
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [totalItems]);

  const scrollToItem = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const scrollTarget =
      el.offsetTop + (idx / totalItems) * el.offsetHeight;
    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="Showcase_showcase__7o16T"
      style={
        {
          "--total-items": totalItems,
          position: "relative",
          width: "100%",
          height: `calc(${totalItems} * 100svh)`,
        } as React.CSSProperties
      }
    >
      {/* Layer 1: Left-Offset Asymmetric WebGL Fluid Canvas */}
      <div
        className="Showcase_showcase_content__aucYY"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: "var(--padding-x)",
          paddingRight: "var(--padding-x)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "clamp(340px, 52vw, 840px)",
            aspectRatio: "1.35",
            cursor: "pointer",
            borderRadius: "0.4rem",
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(8, 9, 12, 0.14)",
          }}
        >
          <ShowcaseCanvas
            imageUrls={imageUrls}
            activeIndex={activeIndex}
            onClick={() => {
              if (activeProject?.uid) {
                routerPrefetch({
                  pathName: `${ROUTES.WORK}/${activeProject.uid}`,
                  pageName: "WorkDetail",
                });
              }
            }}
          />
        </div>
      </div>

      {/* Layer 2: Right Editorial Typography, Services, & Bottom Filmstrip */}
      <div
        className="Showcase_showcase_content__aucYY"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "100svh",
          marginTop: "-100svh",
          pointerEvents: "none",
        }}
      >
        {/* Top-Right Section Header & Counter */}
        <div
          style={{
            position: "absolute",
            top: "12rem",
            right: "calc(var(--padding-x) + 12rem)",
            display: "flex",
            alignItems: "center",
            gap: "2.4rem",
            color: "var(--brand-dark-blue)",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "1.1rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-accent)",
              fontWeight: 600,
            }}
          >
            01 // Selected Archive
          </span>
          <span
            ref={counterRef}
            style={{
              fontFamily: "var(--font-herbik)",
              fontStyle: "italic",
              fontSize: "1.5rem",
              opacity: 0.75,
            }}
          >
            01 / 0{totalItems}
          </span>
        </div>

        {/* Right-Aligned Project Titles */}
        <div
          ref={namesRef}
          className="Showcase_showcase_names__BYqrV"
          style={{
            position: "absolute",
            top: "44%",
            left: "auto",
            right: "calc(var(--padding-x) + 10rem)",
            transform: "translateY(-50%)",
            maxWidth: "56rem",
            width: "42vw",
            textAlign: "right",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {projects.map((proj, idx) => {
            const isActive = idx === 0;
            return (
              <h3
                key={proj.uid || idx}
                className="Showcase_showcase_names_name__FCuyU"
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  top: 0,
                  right: 0,
                  left: "auto",
                  width: "100%",
                  fontSize: "clamp(3.6rem, 5.4vw, 7.8rem)",
                  fontWeight: 600,
                  lineHeight: 0.92,
                  letterSpacing: "-0.035em",
                  color: "var(--brand-dark-blue)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(24px)",
                  filter: isActive ? "blur(0px)" : "blur(10px)",
                  transition: "all 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                {proj.data?.name}
              </h3>
            );
          })}
        </div>

        {/* Right-Aligned Discipline Tags below Title */}
        <div
          ref={servicesRef}
          className="Showcase_showcase_servicesProvided__YwRyH"
          style={{
            position: "absolute",
            top: "64%",
            left: "auto",
            right: "calc(var(--padding-x) + 10rem)",
            transform: "translateY(-50%)",
            textAlign: "right",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {projects.map((proj, idx) => {
            const isActive = idx === 0;
            return (
              <ul
                key={proj.uid || idx}
                className="Showcase_showcase_servicesProvided_services__JBldC"
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  top: 0,
                  right: 0,
                  display: isActive ? "flex" : "none",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  gap: "0.8rem",
                  fontSize: "1.3rem",
                  fontWeight: 500,
                  color: "var(--brand-dark-blue)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(10px)",
                  filter: isActive ? "blur(0px)" : "blur(4px)",
                  transition: "all 0.4s ease",
                  pointerEvents: "none",
                  maxWidth: "42rem",
                }}
              >
                {(proj.data?.services_provided || []).map((s, sIdx) => (
                  <li
                    key={sIdx}
                    style={{
                      padding: "0.4rem 1.2rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(8, 9, 12, 0.22)",
                      background: "rgba(8, 9, 12, 0.04)",
                    }}
                  >
                    {s.service}
                  </li>
                ))}
              </ul>
            );
          })}
        </div>

        {/* Bottom Dock: Horizontal Filmstrip Thumbnails (Left) & View All CTA (Right) */}
        <div
          style={{
            position: "absolute",
            bottom: "4rem",
            left: "var(--padding-x)",
            right: "var(--padding-x)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          <div
            ref={slidesRef}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {projects.map((proj, idx) => {
              const isActive = idx === 0;
              const thumbUrl =
                proj.data?.small_card_thumbnail?.url ||
                proj.data?.card_thumbnail?.url;
              return (
                <button
                  key={proj.uid || idx}
                  type="button"
                  style={{
                    width: "5.4rem",
                    height: "3.4rem",
                    overflow: "hidden",
                    opacity: isActive ? 1 : 0.35,
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    border: "2px solid",
                    borderColor: isActive ? "var(--brand-accent)" : "transparent",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    borderRadius: "3px",
                    background: "#08090c",
                  }}
                  onClick={() => scrollToItem(idx)}
                  aria-label={`Go to project ${idx + 1} of ${totalItems}`}
                >
                  {thumbUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrl}
                      alt={proj.data?.name || ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <TransitionLink
            href="/#section-work"
            className="common-link-effect"
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--brand-dark-blue)",
              padding: "1rem 2.2rem",
              borderRadius: "999px",
              border: "1px solid rgba(8, 9, 12, 0.25)",
            }}
          >
            {viewAllLabel || "EXPLORE FULL ARCHIVE ↓"}
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
