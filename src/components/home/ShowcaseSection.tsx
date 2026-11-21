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
        setActiveIndex(idx);
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
      {/* Layer 1: Center WebGL Canvas */}
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
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "clamp(340px, 45vw, 680px)",
            aspectRatio: "1.28",
            cursor: "pointer",
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

      {/* Layer 2: Right Thumbnails Indicator */}
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
        <div
          className="Showcase_showcase_sliderIndicator__RVWFR"
          style={{
            position: "absolute",
            top: "50%",
            right: "var(--padding-x)",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          {projects.map((proj, idx) => {
            const isActive = idx === activeIndex;
            const thumbUrl =
              proj.data?.small_card_thumbnail?.url ||
              proj.data?.card_thumbnail?.url;
            return (
              <button
                key={proj.uid || idx}
                type="button"
                className="Showcase_showcase_sliderIndicator_slides_slide__WjOxM"
                style={{
                  width: "4.8rem",
                  height: "3.2rem",
                  overflow: "hidden",
                  opacity: isActive ? 1 : 0.35,
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  border: isActive
                    ? "2px solid var(--brand-dark-blue)"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  borderRadius: "2px",
                  background: "#000",
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
      </div>

      {/* Layer 3: Left Titles, Services, and VIEW ALL button */}
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
        {/* Left Project Names */}
        <div
          className="Showcase_showcase_names__BYqrV"
          style={{
            position: "absolute",
            top: "50%",
            left: "var(--padding-x)",
            transform: "translateY(-50%)",
            maxWidth: "42rem",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {projects.map((proj, idx) => {
            const isActive = idx === activeIndex;
            return (
              <h3
                key={proj.uid || idx}
                className="Showcase_showcase_names_name__FCuyU"
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  fontSize: "clamp(3.2rem, 5vw, 6.8rem)",
                  fontWeight: 600,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: "var(--brand-dark-blue)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateY(0)"
                    : "translateY(20px)",
                  filter: isActive ? "blur(0px)" : "blur(8px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                {proj.data?.name}
              </h3>
            );
          })}
        </div>

        {/* Right Services (left of thumbnails) */}
        <div
          className="Showcase_showcase_servicesProvided__YwRyH"
          style={{
            position: "absolute",
            top: "50%",
            right: "calc(var(--padding-x) + 7rem)",
            transform: "translateY(-50%)",
            textAlign: "right",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {projects.map((proj, idx) => {
            const isActive = idx === activeIndex;
            return (
              <ul
                key={proj.uid || idx}
                className="Showcase_showcase_servicesProvided_services__JBldC"
                style={{
                  position: idx === 0 ? "relative" : "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  fontSize: "1.4rem",
                  fontWeight: 500,
                  color: "var(--brand-dark-blue)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateY(0)"
                    : "translateY(10px)",
                  filter: isActive ? "blur(0px)" : "blur(4px)",
                  transition: "all 0.4s ease",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {(proj.data?.services_provided || []).map((s, sIdx) => (
                  <li key={sIdx}>{s.service}</li>
                ))}
              </ul>
            );
          })}
        </div>

        {/* VIEW ALL PROJECTS Link */}
        <div
          className="Showcase_showcase_viewAll__JG5kw"
          style={{
            position: "absolute",
            bottom: "4rem",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          <TransitionLink
            href={ROUTES.WORK}
            className="common-link-effect"
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--brand-dark-blue)",
            }}
          >
            {viewAllLabel || "VIEW ALL PROJECTS"}
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
