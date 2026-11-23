"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { BackgroundTransition } from "@/components/home/BackgroundTransition";
import { SectionIndicator } from "@/components/home/SectionIndicator";
import { ShowcaseSection } from "@/components/home/ShowcaseSection";
import { TeamSection } from "@/components/home/TeamSection";
import {
  IntegratedWorkArchive,
  IntegratedServicesSection,
  IntegratedLabSection,
  IntegratedJobsSection,
} from "@/components/home/MergedSections";
import { HlsVideo } from "@/components/common/HlsVideo";
import { Footer } from "@/components/layout/Footer";
import { useSectionStore, useHeroVideoStore } from "@/stores/appStore";
import { useViewport } from "@/hooks/usePageLifecycle";
import homeData from "@/data/home.json";

gsap.registerPlugin(ScrollTrigger);

interface SliceData {
  slice_type: string;
  primary: Record<string, unknown>;
}

function SectionDetector({
  index,
  children,
  className,
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter: () => useSectionStore.setState({ currentSectionIndex: index }),
      onEnterBack: () => useSectionStore.setState({ currentSectionIndex: index }),
    });
    return () => st.kill();
  }, [index]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// 3. Capabilities Section with Scroll-Triggered Highlight & Blur Reveal
function CapabilitiesSection({
  offerings,
}: {
  offerings: Array<{
    service_offering?: {
      data?: {
        category?: string;
        services?: Array<{ service?: string }>;
      };
    };
  }>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [reachedSet, setReachedSet] = useState<Record<number, boolean>>({ 0: true });
  const { isDesktop } = useViewport();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const items = wrap.querySelectorAll("[data-capability-item]");
    const triggers: ScrollTrigger[] = [];

    items.forEach((el, idx) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 65%",
        end: "bottom 45%",
        onEnter: () => {
          setActiveIdx(idx);
          setReachedSet((prev) => ({ ...prev, [idx]: true }));
        },
        onEnterBack: () => {
          setActiveIdx(idx);
        },
      });
      triggers.push(st);
    });

    return () => triggers.forEach((t) => t.kill());
  }, [offerings.length]);

  return (
    <div
      ref={wrapRef}
      className="Container_container__A7FAx"
      style={{
        minHeight: "100svh",
        paddingTop: isDesktop ? "16rem" : "10rem",
        paddingBottom: isDesktop ? "16rem" : "10rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "1rem",
          borderBottom: "1px solid rgba(242, 239, 233, 0.18)",
          paddingBottom: "2.4rem",
          marginBottom: isDesktop ? "8rem" : "4.8rem",
        }}
      >
        <span
          style={{
            fontSize: "1.2rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--brand-accent)",
            fontWeight: 600,
          }}
        >
          03 // Capabilities &amp; Craft
        </span>
        <span
          style={{
            fontFamily: "var(--font-herbik)",
            fontStyle: "italic",
            fontSize: "1.6rem",
            opacity: 0.7,
          }}
        >
          End-to-End Architecture across 4 Pillars
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: isDesktop ? "8rem" : "5rem" }}>
        {offerings.map((item, idx) => {
          const offering = item.service_offering?.data;
          const isActive = activeIdx === idx;
          const isReached = Boolean(reachedSet[idx]);

          return (
            <div
              key={idx}
              data-capability-item
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 2.2fr auto" : "1fr",
                gap: isDesktop ? "4rem" : "2rem",
                alignItems: "start",
                paddingTop: "3.2rem",
                borderTop: "1px solid rgba(242, 239, 233, 0.12)",
                color: isActive ? "var(--brand-yellow)" : "var(--text-disabled)",
                transition: "color 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
            >
              {/* Left Sticky Category Title */}
              <div
                style={{
                  position: isDesktop ? "sticky" : "relative",
                  top: isDesktop ? "45svh" : "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: isActive ? "var(--brand-accent)" : "inherit",
                      marginBottom: "0.8rem",
                    }}
                  >
                    Pillar 0{idx + 1}
                  </div>
                  <h3
                    style={{
                      fontSize: "clamp(2.4rem, 3vw, 4.2rem)",
                      fontWeight: 600,
                      lineHeight: 1.05,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {offering?.category}
                  </h3>
                </div>
                {!isDesktop && (
                  <div
                    style={{
                      fontFamily: "var(--font-herbik)",
                      fontStyle: "italic",
                      fontSize: "2rem",
                      opacity: isActive ? 0.9 : 0.35,
                    }}
                  >
                    /0{idx + 1}
                  </div>
                )}
              </div>

              {/* Center Large Staggered Capability List */}
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  fontSize: "clamp(2.4rem, 4.4vw, 6.8rem)",
                  fontWeight: 600,
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                }}
              >
                {(offering?.services || []).map((s, sIdx) => (
                  <li
                    key={sIdx}
                    style={{
                      opacity: isReached ? 1 : 0,
                      filter: isReached ? "blur(0px)" : "blur(10px)",
                      transform: isReached ? "translateX(0)" : "translateX(24px)",
                      transition: `opacity 1.1s cubic-bezier(0.165, 0.84, 0.44, 1) ${
                        sIdx * 0.08
                      }s, filter 1.1s cubic-bezier(0.165, 0.84, 0.44, 1) ${
                        sIdx * 0.08
                      }s, transform 1.1s cubic-bezier(0.165, 0.84, 0.44, 1) ${
                        sIdx * 0.08
                      }s`,
                    }}
                  >
                    {s.service}
                  </li>
                ))}
              </ul>

              {/* Right Index Marker (Desktop only) */}
              {isDesktop && (
                <div
                  style={{
                    position: "sticky",
                    top: "45svh",
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "2.4rem",
                    opacity: isActive ? 0.9 : 0.25,
                  }}
                >
                  /0{idx + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Collaborations Section with Inverted Right-Side 3D Rotating Arc & Left Active Logo
function CollaborationsArcSection({
  clients,
  content,
}: {
  clients: Array<{
    id?: string;
    data?: {
      name?: string;
      logo?: { url?: string };
    };
  }>;
  content?: RichTextField;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arcWrapRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef(0);
  const totalClients = clients.length || 1;
  const { isDesktop } = useViewport();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || totalClients <= 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const activeFloat = p * (totalClients - 1);
        const activeIdx = Math.round(activeFloat);

        // Update 3D Arc position on the right side
        if (arcWrapRef.current) {
          const arcItems = arcWrapRef.current.children;
          const radiusRem = isDesktop ? 56 : 28;
          for (let i = 0; i < arcItems.length; i++) {
            const item = arcItems[i] as HTMLElement;
            const rel = i - activeFloat;
            const thetaDeg = rel * 11.5;
            const thetaRad = (thetaDeg * Math.PI) / 180;
            const xOffset = radiusRem * (1 - Math.cos(thetaRad));
            const yOffset = radiusRem * Math.sin(thetaRad);
            const isActive = i === activeIdx;

            item.style.transform = `translate3d(${xOffset.toFixed(2)}rem, calc(-50% + ${yOffset.toFixed(
              2
            )}rem), 0) rotate(${-thetaDeg.toFixed(2)}deg)`;
            item.style.color = isActive
              ? "var(--brand-yellow)"
              : "rgba(242, 239, 233, 0.18)";
            item.style.filter = isActive ? "blur(0px)" : "blur(1.5px)";
          }
        }

        if (activeIdx !== lastActiveRef.current) {
          lastActiveRef.current = activeIdx;
          if (logosRef.current) {
            const logoItems = logosRef.current.children;
            for (let i = 0; i < logoItems.length; i++) {
              const lEl = logoItems[i] as HTMLElement;
              const isCurrent = i === activeIdx;
              lEl.style.opacity = isCurrent ? "1" : "0";
              lEl.style.transform = isCurrent ? "scale(1)" : "scale(0.84)";
              lEl.style.filter = isCurrent ? "blur(0px)" : "blur(8px)";
            }
          }
        }
      },
    });

    return () => st.kill();
  }, [totalClients, isDesktop]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "300svh",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "100svh",
          overflow: "hidden",
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          alignItems: isDesktop ? "center" : "flex-start",
          justifyContent: "space-between",
          padding: isDesktop ? "0 var(--padding-x)" : "9rem var(--padding-x) 4rem",
        }}
      >
        {/* Left/Top Column: Editorial Context + Active Client Logo Badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: isDesktop ? "70svh" : "auto",
            gap: isDesktop ? "0" : "2.4rem",
            maxWidth: isDesktop ? "46rem" : "100%",
            zIndex: 5,
          }}
        >
          <div>
            <span
              style={{
                fontSize: "1.2rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--brand-accent)",
                fontWeight: 600,
                display: "block",
                marginBottom: "1.2rem",
              }}
            >
              04 // Selected Alliances
            </span>
            {content && (
              <div
                style={{
                  fontSize: isDesktop ? "clamp(1.6rem, 1.8vw, 2.2rem)" : "1.5rem",
                  lineHeight: 1.45,
                  color: "var(--text-secondary)",
                }}
              >
                <PrismicRichText field={content} />
              </div>
            )}
          </div>

          {/* Active Client Emblem Showcase Box */}
          <div
            style={{
              width: isDesktop ? "26rem" : "14rem",
              height: isDesktop ? "26rem" : "14rem",
              borderRadius: "50%",
              border: "1px solid rgba(242, 239, 233, 0.2)",
              background: "rgba(242, 239, 233, 0.03)",
              backdropFilter: "blur(12px)",
              display: "grid",
              placeItems: "center",
              position: "relative",
            }}
          >
            <div
              ref={logosRef}
              style={{
                position: "relative",
                width: isDesktop ? "15rem" : "8.5rem",
                height: isDesktop ? "15rem" : "8.5rem",
                display: "grid",
                placeItems: "center",
              }}
            >
              {clients.map((client, idx) => (
                <div
                  key={client?.id || idx}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: idx === 0 ? 1 : 0,
                    transform: idx === 0 ? "scale(1)" : "scale(0.84)",
                    filter: idx === 0 ? "blur(0px)" : "blur(8px)",
                    transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
                  }}
                >
                  {client?.data?.logo?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={client.data.logo.url}
                      alt={client.data.name || ""}
                      style={{
                        maxWidth: "100%",
                        maxHeight: isDesktop ? "8rem" : "4.8rem",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: isDesktop ? "2rem" : "1.4rem", fontWeight: 600 }}>
                      {client?.data?.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: 3D Rotating Typography Wheel / Arc */}
        <div
          ref={arcWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {clients.map((client, idx) => {
            const rel = idx;
            const thetaDeg = rel * 11.5;
            const thetaRad = (thetaDeg * Math.PI) / 180;
            const radiusRem = isDesktop ? 56 : 28;
            const xOffset = radiusRem * (1 - Math.cos(thetaRad));
            const yOffset = radiusRem * Math.sin(thetaRad);

            return (
              <div
                key={client?.id || idx}
                style={{
                  position: "absolute",
                  right: isDesktop ? "18vw" : "var(--padding-x)",
                  top: isDesktop ? "50%" : "68%",
                  transformOrigin: "center right",
                  transform: `translate3d(${xOffset.toFixed(2)}rem, calc(-50% + ${yOffset.toFixed(
                    2
                  )}rem), 0) rotate(${-thetaDeg.toFixed(2)}deg)`,
                  color:
                    idx === 0
                      ? "var(--brand-yellow)"
                      : "rgba(242, 239, 233, 0.18)",
                  fontSize: isDesktop ? "clamp(3.6rem, 5.8vw, 8.6rem)" : "clamp(2.4rem, 7.2vw, 3.8rem)",
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.035em",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  transition: "color 0.35s ease, filter 0.35s ease",
                  willChange: "transform, color",
                }}
              >
                {client?.data?.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 6. Awards Fan-Card Scroll Section
function AwardsFanSection({
  awardList,
}: {
  awardList: Array<{
    award?: {
      id?: string;
      data?: {
        poster?: { url?: string; alt?: string };
      };
    };
  }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const totalAwards = awardList.length || 1;

  useEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content || totalAwards <= 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        content.style.setProperty("--awards-progress", self.progress.toFixed(4));
      },
    });

    return () => st.kill();
  }, [totalAwards]);

  return (
    <div
      ref={containerRef}
      className="Awards_awards__6qOsC"
      data-in-view="true"
      style={{ position: "relative" }}
    >
      <div className="Awards_awards_sticky__QGQF2">
        {/* Background Editorial Header inside Sticky Container */}
        <div
          style={{
            position: "absolute",
            top: "11rem",
            left: "var(--padding-x)",
            right: "var(--padding-x)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "var(--brand-dark-blue)",
            borderBottom: "1px solid rgba(8, 9, 12, 0.18)",
            paddingBottom: "1.8rem",
            zIndex: 5,
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-accent)",
              fontWeight: 600,
            }}
          >
            06 // International Recognition
          </span>
          <span
            style={{
              fontFamily: "var(--font-herbik)",
              fontStyle: "italic",
              fontSize: "1.6rem",
              opacity: 0.75,
            }}
          >
            Selected Honors &amp; Exhibitions
          </span>
        </div>

        <div
          ref={contentRef}
          className="Awards_awards_content__MML99"
          style={
            {
              "--awards-progress": 0,
              "--awards-last-index": Math.max(0, totalAwards - 1),
            } as React.CSSProperties
          }
        >
          {awardList.map((aw, idx) => {
            const poster = aw.award?.data?.poster;
            return (
              <div
                key={aw.award?.id || idx}
                className="Awards_awards_item__wrbdK"
                style={
                  {
                    "--card-index": idx,
                    boxShadow: "0 28px 60px rgba(8, 9, 12, 0.22)",
                    borderRadius: "0.4rem",
                    overflow: "hidden",
                  } as React.CSSProperties
                }
              >
                {poster?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster.url}
                    alt={poster.alt || ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const globalDoc = homeData.globalDocument as unknown as {
    data: {
      email_address?: string;
      branches?: Array<{
        utc?: string | number;
        country?: string;
        address_block?: RichTextField;
        phone_number?: string;
      }>;
      socials?: Array<{
        key?: string;
        link_type?: string;
        url?: string;
        text?: string;
      }>;
      slices?: SliceData[];
    };
  };

  const homeSlices = (homeData.homeDocument as unknown as { data: { slices: SliceData[] } })
    .data.slices;
  const bgMedia = homeData.backgroundMedia as Record<
    string,
    { videoUrl?: string; posterUrl?: string }
  >;

  const findSlice = (type: string) =>
    homeSlices.find((s) => s.slice_type === type)?.primary ?? {};

  const hero = findSlice("hero") as {
    year_label?: string;
    language_list?: Array<{ language?: string }>;
    featured_mux_id?: string;
    featured_video_url?: string;
    featured_word?: Array<{ word?: string }>;
    title?: Array<{
      line_1?: string;
      line_2?: string;
      line_3_left?: string;
      line_3_right?: string;
    }>;
  };
  const about = findSlice("home_about") as {
    section_name?: string;
    primary_content?: RichTextField;
    secondary_content?: RichTextField;
  };
  const whatWeDo = findSlice("home_services") as {
    section_name?: string;
    service_offering_list?: Array<{
      service_offering?: {
        data?: {
          category?: string;
          services?: Array<{ service?: string }>;
        };
      };
    }>;
  };
  const showcase = findSlice("home_projects") as {
    section_name?: string;
    view_all_label?: string;
    project_list?: Array<{
      project?: {
        uid?: string;
        data?: {
          name?: string;
          card_thumbnail?: { url?: string };
          services_provided?: Array<{ service?: string }>;
        };
      };
    }>;
  };
  const fullScreenMedia = findSlice("full_screen_media") as {
    title?: RichTextField;
  };
  const team = findSlice("home_members") as {
    section_name?: string;
    member_list?: Array<{
      member?: {
        id?: string;
        data?: {
          avatar?: { url?: string; alt?: string };
          description?: RichTextField;
        };
      };
    }>;
  };
  const collaborations = findSlice("home_clients") as {
    section_name?: string;
    content?: RichTextField;
    client_list?: Array<{
      client?: {
        id?: string;
        data?: {
          name?: string;
          logo?: { url?: string };
        };
      };
    }>;
  };
  const awards = findSlice("home_awards") as {
    section_name?: string;
    award_list?: Array<{
      award?: {
        id?: string;
        data?: {
          poster?: { url?: string; alt?: string };
        };
      };
    }>;
  };
  const presses = findSlice("home_presses") as {
    label?: string;
    press_list?: Array<{
      press?: {
        id?: string;
        data?: {
          publication_name?: string;
          link?: { url?: string };
          thumbnail?: { url?: string; alt?: string };
        };
      };
    }>;
  };

  const footerSlice = globalDoc.data.slices?.find(
    (s) => s.slice_type === "footer"
  )?.primary as { featured_word?: Array<{ word?: string }> } | undefined;

  const [heroExpanded, setHeroExpanded] = useState(false);
  const [heroWordIdx, setHeroWordIdx] = useState(0);
  const { isDesktop } = useViewport();

  const heroTitle = hero.title?.[0];
  const heroWords = useMemo(
    () =>
      hero.featured_word && hero.featured_word.length > 0
        ? hero.featured_word.map((w) => w.word || "COLLECTIVE")
        : ["COLLECTIVE", "ATELIER", "PRACTICE"],
    [hero.featured_word]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHeroWordIdx((i) => (i + 1) % heroWords.length);
    }, 3200);
    return () => clearInterval(id);
  }, [heroWords.length]);

  const heroVideoUrl = hero.featured_mux_id
    ? `https://stream.mux.com/${hero.featured_mux_id}.m3u8`
    : hero.featured_video_url || "";
  const heroPosterUrl = hero.featured_mux_id
    ? `https://image.mux.com/${hero.featured_mux_id}/thumbnail.jpg`
    : undefined;

  const projects = useMemo(
    () => (showcase.project_list || []).map((p) => p.project).filter(Boolean),
    [showcase.project_list]
  );

  const clients = useMemo(
    () => (collaborations.client_list || []).map((c) => c.client).filter(Boolean),
    [collaborations.client_list]
  );

  useEffect(() => {
    useHeroVideoStore.getState().actions.setExpanded(heroExpanded);
  }, [heroExpanded]);

  return (
    <main className="Home_home__placeholder" style={{ position: "relative" }}>
      <BackgroundTransition backgroundMedia={bgMedia} />
      <SectionIndicator />

      <div className="Home_home_page_fromAbout__hN4CY" style={{ position: "relative", zIndex: 1 }}>
        {/* 0. HERO: Asymmetric Architectural Grid */}
        <SectionDetector index={0} className="Hero_hero__kuzag">
          <div
            id="section-hero"
            className="Container_container__A7FAx"
            style={{
              minHeight: "100svh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingTop: "13rem",
              paddingBottom: "4.8rem",
              position: "relative",
              width: "100%",
            }}
          >
            {/* Top Row: Left Studio Coordinates & Right Floating Showreel Portal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                gap: "3.2rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "1rem",
                    fontSize: "1.1rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--brand-accent)",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: "0.6rem",
                      height: "0.6rem",
                      borderRadius: "50%",
                      background: "var(--brand-accent)",
                    }}
                  />
                  <span>{hero.year_label || "Est. 2020"} — Independent Creative Practice</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "1.5rem",
                    opacity: 0.75,
                  }}
                >
                  {(
                    hero.language_list || [
                      { language: "Saigon" },
                      { language: "Hong Kong" },
                      { language: "Tokyo" },
                      { language: "Paris" },
                    ]
                  ).map((l, i, arr) => (
                    <React.Fragment key={i}>
                      <span>{l.language}</span>
                      {i < arr.length - 1 && <span style={{ opacity: 0.35 }}>/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Floating Top-Right Interactive Showreel Card */}
              {heroVideoUrl && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2rem",
                    background: "rgba(242, 239, 233, 0.05)",
                    backdropFilter: "blur(16px)",
                    padding: "1rem 1.2rem 1rem 2.2rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(242, 239, 233, 0.16)",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--brand-accent)",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Showreel Anthology
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeroExpanded(true)}
                      className="common-link-effect"
                      style={{
                        fontSize: "1.4rem",
                        fontFamily: "var(--font-herbik)",
                        fontStyle: "italic",
                      }}
                    >
                      Expand Fullscreen ↗
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroExpanded(true)}
                    aria-label="Play showreel"
                    style={{
                      width: "16.5rem",
                      height: "9.4rem",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: "0.3rem",
                      border: "1px solid rgba(242, 239, 233, 0.25)",
                    }}
                  >
                    <HlsVideo
                      src={heroVideoUrl}
                      poster={heroPosterUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row: Asymmetric Left-Aligned Staggered Display Typography */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
                marginTop: "auto",
                paddingTop: "6rem",
              }}
            >
              <div
                style={{
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "clamp(3.8rem, 6.8vw, 10.6rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.038em",
                  textTransform: "uppercase",
                }}
              >
                <div style={{ opacity: 0.92 }}>
                  {heroTitle?.line_1 || "WE ARE AN"}
                </div>
                <div
                  style={{
                    paddingLeft: "clamp(2rem, 7vw, 12rem)",
                    display: "flex",
                    alignItems: "center",
                    gap: "2rem",
                  }}
                >
                  <span>{heroTitle?.line_2 || "ARTIST — LED"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "2.4rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{heroTitle?.line_3_left || "CREATIVE"}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-herbik)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      color: "var(--brand-accent)",
                      textTransform: "none",
                      letterSpacing: "-0.01em",
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {heroWords[heroWordIdx]}
                  </span>
                </div>
              </div>

              {/* Right Bottom Scroll Prompt */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.4rem",
                  paddingBottom: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                  }}
                >
                  Scroll to Explore
                </span>
                <div
                  style={{
                    width: "3.6rem",
                    height: "3.6rem",
                    borderRadius: "50%",
                    border: "1px solid rgba(242, 239, 233, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  ↓
                </div>
              </div>
            </div>
          </div>
        </SectionDetector>

        {/* 1. FEATURED WORK / SHOWCASE (WebGL Fluid Distortion Canvas) */}
        <SectionDetector index={1}>
          <ShowcaseSection
            projects={projects as any}
            viewAllLabel="EXPLORE FULL ARCHIVE ↓"
          />
        </SectionDetector>

        {/* 2. COMPLETE WORKS ARCHIVE (Merged from /work) */}
        <SectionDetector index={2}>
          <IntegratedWorkArchive />
        </SectionDetector>

        {/* 3. PHILOSOPHY / ABOUT (Asymmetric Two-Column Editorial Split) */}
        <SectionDetector index={3} className="About_about__4nzIM">
          <div
            className="Container_container__A7FAx"
            style={{
              minHeight: "100svh",
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr",
              alignItems: "center",
              gap: isDesktop ? "6rem" : "3.6rem",
              paddingTop: isDesktop ? "14rem" : "10rem",
              paddingBottom: isDesktop ? "14rem" : "10rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3.2rem",
                borderLeft: "2px solid var(--brand-accent)",
                paddingLeft: "2.4rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "1.2rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--brand-accent)",
                    fontWeight: 600,
                    display: "block",
                    marginBottom: "0.8rem",
                  }}
                >
                  03 // Philosophy
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "1.8rem",
                    opacity: 0.8,
                  }}
                >
                  Craft at the intersection of culture &amp; code
                </span>
              </div>
              {about.secondary_content && (
                <div
                  style={{
                    fontSize: "1.6rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <PrismicRichText field={about.secondary_content} />
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "clamp(2.8rem, 4.2vw, 6.2rem)",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                textAlign: "left",
              }}
            >
              {about.primary_content && (
                <PrismicRichText field={about.primary_content} />
              )}
            </div>
          </div>
        </SectionDetector>

        {/* 4. CAPABILITIES & SERVICES ARCHITECTURE (WhatWeDo + /services Matrix) */}
        <SectionDetector index={4}>
          <CapabilitiesSection
            offerings={whatWeDo.service_offering_list || []}
          />
          <IntegratedServicesSection />
        </SectionDetector>

        {/* 5. COLLABORATIONS / ALLIANCES (3D Rotating Arc on Right + Emblem Showcase on Left) */}
        <SectionDetector index={5} className="Collaborations_collaborations__ZmUpq">
          <CollaborationsArcSection
            clients={clients as any}
            content={collaborations.content}
          />
        </SectionDetector>

        {/* 6. THE COLLECTIVE / TEAM & FULL SCREEN MEDIA */}
        <SectionDetector index={6}>
          <TeamSection
            reelTitle={fullScreenMedia.title}
            members={(team.member_list || []).map((m) => m.member).filter(Boolean) as any}
          />
        </SectionDetector>

        {/* 7. R&D VISUAL LABORATORY + INTERACTIVE RUNNING GIF ENGINE (Merged from /lab) */}
        <SectionDetector index={7}>
          <IntegratedLabSection />
        </SectionDetector>

        {/* 8. RECOGNITION / AWARDS (Scroll-Scrubbed Fan Cards on Light Alabaster Mode) */}
        <SectionDetector index={8}>
          <AwardsFanSection awardList={awards.award_list || []} />
        </SectionDetector>

        {/* 9. OPEN POSITIONS / CAREERS (Merged from /jobs) & PRESS COVERAGE */}
        <SectionDetector index={9}>
          <IntegratedJobsSection />

          {presses.press_list && presses.press_list.length > 0 && (
            <div className="Presses_presses__keppm" style={{ paddingTop: "8rem" }}>
              <div className="Container_container__A7FAx">
                <div className="Grid_grid__8e_U7 Presses_presses_grid___Uehv">
                  <div className="Presses_presses_label__ZbO4v">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--brand-accent)",
                          fontWeight: 600,
                        }}
                      >
                        Press &amp; Features
                      </span>
                      <span
                        className="Presses_presses_label_text__e9jFT"
                        style={{ opacity: 0.75 }}
                      >
                        Global Editorial Coverage
                      </span>
                    </div>
                  </div>

                  <ul className="Presses_presses_list__Uei03">
                    {presses.press_list.map((pr, idx) => {
                      const pressData = pr.press?.data;
                      return (
                        <li key={pr.press?.id || idx}>
                          <a
                            href={pressData?.link?.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="Presses_presses_item__ZRqaJ"
                            style={{
                              justifyContent: "space-between",
                              borderBottom: "1px solid rgba(242, 239, 233, 0.14)",
                              padding: "2rem 0",
                            }}
                          >
                            <span
                              className="Presses_presses_item_title__xYMjH"
                              style={{
                                opacity: 1,
                                filter: "blur(0px)",
                              }}
                            >
                              {pressData?.publication_name}
                            </span>
                            {pressData?.thumbnail?.url && (
                              <span
                                className="Presses_presses_item_thumbnail__8fJDD"
                                style={{
                                  clipPath: "inset(0% 0% 0% 0%)",
                                  borderRadius: "0.3rem",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pressData.thumbnail.url}
                                  alt={
                                    pressData.thumbnail.alt ||
                                    pressData.publication_name ||
                                    ""
                                  }
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transform: "scale(1.05)",
                                  }}
                                />
                              </span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </SectionDetector>

        {/* 10. FOOTER */}
        <SectionDetector index={10}>
          <Footer
            contactEmail={globalDoc.data.email_address}
            branches={globalDoc.data.branches}
            featuredWords={footerSlice?.featured_word}
            socials={globalDoc.data.socials}
          />
        </SectionDetector>
      </div>

      {/* Fullscreen Hero Showreel Modal */}
      {heroExpanded && heroVideoUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setHeroExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setHeroExpanded(false)}
            style={{
              position: "fixed",
              top: "3.2rem",
              right: "4.8rem",
              color: "var(--brand-yellow)",
              fontSize: "1.6rem",
              zIndex: 121,
              padding: "0.8rem 1.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(242, 239, 233, 0.3)",
              background: "rgba(8, 9, 12, 0.7)",
            }}
          >
            Close ×
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100vw", height: "100vh" }}>
            <HlsVideo
              src={heroVideoUrl}
              poster={heroPosterUrl}
              muted={false}
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
