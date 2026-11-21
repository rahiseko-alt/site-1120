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
import { HlsVideo } from "@/components/common/HlsVideo";
import { TransitionLink } from "@/components/common/TransitionLink";
import { Footer } from "@/components/layout/Footer";
import { useSectionStore, useHeroVideoStore } from "@/stores/appStore";
import { useRouterTransition } from "@/hooks/usePageLifecycle";
import { ROUTES } from "@/lib/constants";
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

  const [activeShowcaseIdx, setActiveShowcaseIdx] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const { routerPrefetch } = useRouterTransition();

  const heroTitle = hero.title?.[0];
  const heroWord = hero.featured_word?.[0]?.word || "AGENCY";

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

  const showcaseImages = useMemo(
    () =>
      projects.map(
        (p) => p?.data?.card_thumbnail?.url || "/images/test.jpg"
      ),
    [projects]
  );

  const activeProject = projects[activeShowcaseIdx];
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

      <div style={{ position: "relative", marginTop: "-100lvh", zIndex: 1 }}>
      {/* 0. HERO */}
      <SectionDetector index={0} className="Hero_hero__kuzag">
        <div
          className="Container_container__A7FAx"
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                fontSize: "1.4rem",
              }}
            >
              {hero.year_label || "Since 2020"}
            </span>

            <div
              style={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: "clamp(3.6rem, 6.2vw, 9.6rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              <div>{heroTitle?.line_1 || "WE ARE AN"}</div>
              <div>{heroTitle?.line_2 || "ARTIST — LED"}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.6rem",
                }}
              >
                <span>{heroTitle?.line_3_left || "CREATIVE"}</span>
                {heroVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroExpanded(true)}
                    aria-label="Play showreel"
                    style={{
                      width: "14rem",
                      height: "6.4rem",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: "0.2rem",
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
                )}
              </div>
              <div>{heroWord}</div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                fontSize: "1.4rem",
              }}
            >
              {(hero.language_list || [{ language: "VN" }, { language: "CN" }, { language: "FR" }]).map(
                (l, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{l.language}</span>
                    {i < arr.length - 1 && <span style={{ opacity: 0.4 }}>|</span>}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "2.4rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <div
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                border: "1px solid var(--brand-yellow)",
              }}
            />
            <div
              style={{
                width: "1px",
                height: "5rem",
                background: "rgba(255, 253, 226, 0.35)",
              }}
            />
          </div>
        </div>
      </SectionDetector>

      {/* 1. ABOUT */}
      <SectionDetector index={1} className="About_about__4nzIM">
        <div
          className="Container_container__A7FAx"
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "12rem",
            paddingBottom: "12rem",
            gap: "4rem",
          }}
        >
          <div style={{ maxWidth: "70rem", marginLeft: "auto", marginRight: "auto", fontSize: "clamp(2.4rem, 3.2vw, 4.8rem)", lineHeight: 1.15 }}>
            {about.primary_content && <PrismicRichText field={about.primary_content} />}
          </div>
          {about.secondary_content && (
            <div style={{ maxWidth: "46rem", marginLeft: "auto", marginRight: "auto", fontSize: "1.6rem", opacity: 0.85, lineHeight: 1.5 }}>
              <PrismicRichText field={about.secondary_content} />
            </div>
          )}
        </div>
      </SectionDetector>

      {/* 2. WHAT WE DO */}
      <SectionDetector index={2} className="WhatWeDo_whatWeDo__jsor8">
        <div
          className="Container_container__A7FAx"
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "12rem",
            paddingBottom: "12rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "4rem",
              maxWidth: "100rem",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {(whatWeDo.service_offering_list || []).map((item, idx) => {
              const offering = item.service_offering?.data;
              return (
                <div key={idx} style={{ borderTop: "1px solid rgba(255,253,226,0.2)", paddingTop: "2rem" }}>
                  <span style={{ fontSize: "1.2rem", fontFamily: "var(--font-herbik)", fontStyle: "italic", opacity: 0.6 }}>
                    0{idx + 1}
                  </span>
                  <h3 style={{ fontSize: "2.4rem", fontWeight: 600, marginTop: "1rem", marginBottom: "1.2rem" }}>
                    {offering?.category}
                  </h3>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "1.5rem", opacity: 0.8 }}>
                    {(offering?.services || []).map((s, sIdx) => (
                      <li key={sIdx}>{s.service}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </SectionDetector>

      {/* 3. FEATURED WORK / SHOWCASE */}
      <SectionDetector index={3}>
        <ShowcaseSection
          projects={projects as any}
          viewAllLabel={showcase.view_all_label}
        />
      </SectionDetector>

      {/* 4. TEAM & FULL SCREEN MEDIA */}
      <SectionDetector index={4}>
        <TeamSection
          reelTitle={fullScreenMedia.title}
          members={(team.member_list || []).map((m) => m.member).filter(Boolean) as any}
        />
      </SectionDetector>

      {/* 5. COLLABORATIONS / CLIENTS */}
      <SectionDetector index={5} className="Collaborations_collaborations__ZmUpq">
        <div
          className="Container_container__A7FAx"
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "12rem",
            paddingBottom: "12rem",
            gap: "4rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "2.4rem",
              alignItems: "center",
            }}
          >
            {clients.map((client, idx) => (
              <div
                key={client?.id || idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "2rem",
                }}
              >
                {client?.data?.logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.data.logo.url}
                    alt={client.data.name || ""}
                    style={{ maxHeight: "4.2rem", width: "auto", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 600 }}>{client?.data?.name}</span>
                )}
              </div>
            ))}
          </div>

          {collaborations.content && (
            <div style={{ maxWidth: "46rem", marginLeft: "auto", fontSize: "1.6rem", opacity: 0.9 }}>
              <PrismicRichText field={collaborations.content} />
            </div>
          )}
        </div>
      </SectionDetector>

      {/* 6. AWARDS */}
      <SectionDetector index={6} className="Awards_awards__6qOsC">
        <div
          className="Container_container__A7FAx"
          style={{
            minHeight: "100svh",
            color: "var(--brand-dark-blue)",
            display: "flex",
            alignItems: "center",
            paddingTop: "12rem",
            paddingBottom: "12rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "2.8rem",
              overflowX: "auto",
              padding: "4rem 2rem",
              width: "100%",
              alignItems: "center",
            }}
          >
            {(awards.award_list || []).map((aw, idx) => {
              const poster = aw.award?.data?.poster;
              return (
                <div
                  key={aw.award?.id || idx}
                  style={{
                    flex: "0 0 28rem",
                    transform: `rotate(${idx % 2 === 0 ? -3 : 3}deg)`,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
                  }}
                >
                  {poster?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster.url}
                      alt={poster.alt || ""}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SectionDetector>

      {/* 7. PRESSES */}
      {presses.press_list && presses.press_list.length > 0 && (
        <SectionDetector index={7} className="Presses_presses__keppm">
          <div className="Container_container__A7FAx" style={{ paddingTop: "8rem", paddingBottom: "8rem" }}>
            <p style={{ fontSize: "1.4rem", marginBottom: "2.4rem", opacity: 0.7 }}>
              {presses.label || "Press"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2.4rem" }}>
              {presses.press_list.map((pr, idx) => {
                const pressData = pr.press?.data;
                return (
                  <a
                    key={pr.press?.id || idx}
                    href={pressData?.link?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    {pressData?.thumbnail?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pressData.thumbnail.url}
                        alt={pressData.thumbnail.alt || pressData.publication_name || ""}
                        style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover" }}
                      />
                    )}
                    <span style={{ fontSize: "1.6rem", fontWeight: 500 }}>
                      {pressData?.publication_name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </SectionDetector>
      )}

      {/* 8. FOOTER */}
      <SectionDetector index={8}>
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
              color: "#fffde2",
              fontSize: "1.6rem",
              zIndex: 121,
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
