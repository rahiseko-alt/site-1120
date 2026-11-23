"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShowcaseCanvas } from "@/components/home/ShowcaseCanvas";
import { TransitionLink } from "@/components/common/TransitionLink";
import { useRouterTransition, useViewport } from "@/hooks/usePageLifecycle";
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
  const { isDesktop } = useViewport();

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
              child.style.transform = isActive ? "scale(1.08)" : "scale(1)";
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

  const openActiveProject = () => {
    if (activeProject?.uid) {
      routerPrefetch({
        pathName: `${ROUTES.WORK}/${activeProject.uid}`,
        pageName: "WorkDetail",
      });
    }
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
          height: `calc(${totalItems} * 135svh)`,
        } as React.CSSProperties
      }
    >
      {isDesktop ? (
        <>
          {/* DESKTOP: Left WebGL Fluid Canvas (Maximized Window) */}
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
                width: "clamp(480px, 58vw, 1080px)",
                height: "76svh",
                cursor: "pointer",
                borderRadius: "0.4rem",
                overflow: "hidden",
                boxShadow: "0 30px 70px rgba(8, 9, 12, 0.14)",
              }}
            >
              <ShowcaseCanvas
                imageUrls={imageUrls}
                activeIndex={activeIndex}
                onClick={openActiveProject}
              />
            </div>
          </div>

          {/* DESKTOP: Right Editorial Typography, Services, & Bottom Filmstrip */}
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
                right: "calc(var(--padding-x) + 10rem)",
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
                maxWidth: "46rem",
                width: "31vw",
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
                      fontSize: "clamp(3.4rem, 4.8vw, 7.2rem)",
                      fontWeight: 600,
                      lineHeight: 0.94,
                      letterSpacing: "-0.035em",
                      color: "var(--brand-dark-blue)",
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(24px)",
                      filter: isActive ? "blur(0px)" : "blur(10px)",
                      transition: "all 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
                      pointerEvents: isActive ? "auto" : "none",
                      cursor: "pointer",
                    }}
                    onClick={openActiveProject}
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
                top: "65%",
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
                      maxWidth: "40rem",
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
                        transform: isActive ? "scale(1.08)" : "scale(1)",
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
                {viewAllLabel || "EXPLORE FULL ARCHIVE →"}
              </TransitionLink>
            </div>
          </div>
        </>
      ) : (
        /* MOBILE & TABLET: Clean Stacked Vertical Sticky Layout (Maximized Window, Zero Overlap) */
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100%",
            height: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "7.2rem var(--padding-x) 2.2rem",
            overflow: "hidden",
            color: "var(--brand-dark-blue)",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                letterSpacing: "0.14em",
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
                fontSize: "1.4rem",
                opacity: 0.75,
              }}
            >
              01 / 0{totalItems}
            </span>
          </div>

          {/* WebGL Canvas Container (Maximized Window) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "52svh",
              maxHeight: "48rem",
              borderRadius: "0.6rem",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(8, 9, 12, 0.14)",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            <ShowcaseCanvas
              imageUrls={imageUrls}
              activeIndex={activeIndex}
              onClick={openActiveProject}
            />
          </div>

          {/* Dedicated Non-Overlapping Title & Tags Block below Image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              width: "100%",
              minHeight: "8.2rem",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              ref={namesRef}
              style={{
                position: "relative",
                width: "100%",
                minHeight: "3.8rem",
              }}
            >
              {projects.map((proj, idx) => {
                const isActive = idx === 0;
                return (
                  <h3
                    key={proj.uid || idx}
                    style={{
                      position: idx === 0 ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      fontSize: "clamp(2.4rem, 7vw, 3.8rem)",
                      fontWeight: 600,
                      lineHeight: 1.02,
                      letterSpacing: "-0.03em",
                      color: "var(--brand-dark-blue)",
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(16px)",
                      filter: isActive ? "blur(0px)" : "blur(8px)",
                      transition: "all 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                      pointerEvents: isActive ? "auto" : "none",
                      cursor: "pointer",
                    }}
                    onClick={openActiveProject}
                  >
                    {proj.data?.name}
                  </h3>
                );
              })}
            </div>

            <div
              ref={servicesRef}
              style={{
                position: "relative",
                width: "100%",
                minHeight: "2.8rem",
              }}
            >
              {projects.map((proj, idx) => {
                const isActive = idx === 0;
                return (
                  <ul
                    key={proj.uid || idx}
                    style={{
                      position: "relative",
                      display: isActive ? "flex" : "none",
                      flexWrap: "wrap",
                      justifyContent: "flex-start",
                      gap: "0.6rem",
                      fontSize: "1.15rem",
                      fontWeight: 500,
                      color: "var(--brand-dark-blue)",
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(8px)",
                      filter: isActive ? "blur(0px)" : "blur(4px)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    {(proj.data?.services_provided || []).map((s, sIdx) => (
                      <li
                        key={sIdx}
                        style={{
                          padding: "0.35rem 1rem",
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
          </div>

          {/* Bottom Filmstrip + View All CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "100%",
              flexShrink: 0,
            }}
          >
            <div
              ref={slidesRef}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "0.8rem",
                alignItems: "center",
                overflowX: "auto",
                paddingBottom: "0.2rem",
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
                      width: "4.8rem",
                      height: "3rem",
                      flexShrink: 0,
                      overflow: "hidden",
                      opacity: isActive ? 1 : 0.35,
                      transform: isActive ? "scale(1.08)" : "scale(1)",
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <TransitionLink
                href="/#section-work"
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--brand-dark-blue)",
                  padding: "0.8rem 1.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(8, 9, 12, 0.25)",
                  display: "inline-block",
                }}
              >
                {viewAllLabel || "EXPLORE FULL ARCHIVE →"}
              </TransitionLink>
              <span style={{ fontSize: "1.1rem", opacity: 0.6 }}>Tap visual to inspect</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
