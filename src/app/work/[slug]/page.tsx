"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import Hls from "hls.js";
import { TransitionLink } from "@/components/common/TransitionLink";
import { HlsVideo } from "@/components/common/HlsVideo";
import { ROUTES } from "@/lib/constants";

import p88rising from "@/data/projects/88rising.json";
import pCartierChristmas from "@/data/projects/cartier-christmas-minisite.json";
import pCartierVision from "@/data/projects/cartier-vision-pro.json";
import pFromearth from "@/data/projects/fromearth-2050.json";
import pHighlands from "@/data/projects/highlands.json";
import pLasalle from "@/data/projects/lasalle-show.json";
import pLvSeries from "@/data/projects/louis-vuitton-series.json";
import pMomentFactory from "@/data/projects/moment-factory.json";
import pOneplus12 from "@/data/projects/oneplus-12.json";
import pOneplusBuds4 from "@/data/projects/oneplus-buds-4.json";
import pOneplusBudsPro3 from "@/data/projects/oneplus-buds-pro-3.json";
import pOneplusPadGo2 from "@/data/projects/oneplus-pad-go-2.json";
import pOneplusPowered from "@/data/projects/oneplus-powered-to-play-all-day.json";
import pRome from "@/data/projects/rome-in-silver-waiting-mv.json";
import pEternalHorse from "@/data/projects/the-eternal-horse-x-marina-ifc.json";
import pUltimune from "@/data/projects/ultimune-shiseido.json";
import pLaMer from "@/data/projects/year-of-the-rabbit-la-mer.json";

const PROJECTS_MAP: Record<string, { project: ProjectData }> = {
  "88rising": p88rising as unknown as { project: ProjectData },
  "cartier-christmas-minisite": pCartierChristmas as unknown as { project: ProjectData },
  "cartier-vision-pro": pCartierVision as unknown as { project: ProjectData },
  "fromearth-2050": pFromearth as unknown as { project: ProjectData },
  highlands: pHighlands as unknown as { project: ProjectData },
  "lasalle-show": pLasalle as unknown as { project: ProjectData },
  "louis-vuitton-series": pLvSeries as unknown as { project: ProjectData },
  "moment-factory": pMomentFactory as unknown as { project: ProjectData },
  "oneplus-12": pOneplus12 as unknown as { project: ProjectData },
  "oneplus-buds-4": pOneplusBuds4 as unknown as { project: ProjectData },
  "oneplus-buds-pro-3": pOneplusBudsPro3 as unknown as { project: ProjectData },
  "oneplus-pad-go-2": pOneplusPadGo2 as unknown as { project: ProjectData },
  "oneplus-powered-to-play-all-day": pOneplusPowered as unknown as { project: ProjectData },
  "rome-in-silver-waiting-mv": pRome as unknown as { project: ProjectData },
  "the-eternal-horse-x-marina-ifc": pEternalHorse as unknown as { project: ProjectData },
  "ultimune-shiseido": pUltimune as unknown as { project: ProjectData },
  "year-of-the-rabbit-la-mer": pLaMer as unknown as { project: ProjectData },
};

interface MediaEntry {
  mux_id?: string;
  video_url?: string;
  image?: { url?: string };
  mobile_image?: { url?: string };
  thumbnail?: { url?: string };
}

interface SliceEntry {
  slice_type: string;
  primary?: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
}

interface ProjectData {
  uid: string;
  data: {
    name?: string;
    template?: string | null;
    client?: string;
    year?: string;
    description?: RichTextField;
    services_provided?: Array<{ service?: string }>;
    card_thumbnail?: { url?: string };
    media?: MediaEntry[];
    slices?: SliceEntry[];
    external_url?: { url?: string };
    subtitle?: string;
    tagline?: string;
  };
}

function SlideVideo({
  url,
  active,
  muted,
  paused,
  onProgress,
}: {
  url: string;
  active: boolean;
  muted: boolean;
  paused: boolean;
  onProgress: (p: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !url) return;
    const resolvedUrl = url.includes(".mux.com")
      ? `/api/mux?url=${encodeURIComponent(url)}`
      : url;
    let hls: Hls | null = null;
    if (url.includes(".m3u8")) {
      if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = resolvedUrl;
      } else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.attachMedia(el);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls?.loadSource(resolvedUrl));
      }
    } else {
      el.src = resolvedUrl;
    }
    return () => hls?.destroy();
  }, [url]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    if (active && !paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, muted, paused]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const onTime = () => {
      if (el.duration && Number.isFinite(el.duration)) {
        onProgress(el.currentTime / el.duration);
      }
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [active, onProgress]);

  return (
    <video
      ref={ref}
      playsInline
      loop
      muted={muted}
      crossOrigin="anonymous"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

function WebCaseStudyView({ project }: { project: ProjectData }) {
  const slices = project.data.slices || [];
  const heroThumb = project.data.card_thumbnail?.url;
  const [motionPaused, setMotionPaused] = useState(false);

  useEffect(() => {
    document.body.classList.add("web-project-active");
    return () => document.body.classList.remove("web-project-active");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "var(--brand-yellow)", paddingBottom: "10rem" }}>
      <div className="Container_container__A7FAx" style={{ paddingTop: "11rem" }}>
        <div
          style={{
            background: "var(--brand-yellow)",
            color: "#000",
            borderRadius: "2.4rem",
            padding: "4.8rem",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "4rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "4rem" }}>
            <span style={{ fontSize: "1.4rem", opacity: 0.7 }}>Work</span>
            <h1 style={{ fontSize: "clamp(4rem, 6vw, 8.8rem)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
              {project.data.name}
            </h1>
            <p style={{ fontSize: "1.6rem", opacity: 0.8 }}>
              An interactive globe to explore the future through the places we know.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
            <span style={{ fontSize: "1.4rem", opacity: 0.7, alignSelf: "flex-end" }}>
              Web experience &amp; visual identity
            </span>
            <div>
              <h2 style={{ fontSize: "clamp(2.8rem, 3.6vw, 5.2rem)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
                Your world.
                <br />
                <em style={{ fontFamily: "var(--font-ivory), serif", fontWeight: 500 }}>Seen differently.</em>
              </h2>
              {project.data.external_url?.url && (
                <a
                  href={project.data.external_url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: "2rem", fontSize: "1.5rem", fontWeight: 500 }}
                >
                  Explore the website ↗
                </a>
              )}
            </div>
            <a
              href="#case-studies"
              style={{ alignSelf: "flex-end", fontSize: "1.5rem", fontWeight: 500 }}
            >
              Explore the project ↓
            </a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2.4rem" }}>
          <button
            type="button"
            onClick={() => setMotionPaused((p) => !p)}
            style={{
              border: "1px solid rgba(255,253,226,0.25)",
              borderRadius: "1rem",
              padding: "1rem 1.8rem",
              fontSize: "1.4rem",
              color: "var(--brand-yellow)",
            }}
          >
            {motionPaused ? "Resume motion ▶" : "Pause motion ⏸"}
          </button>
        </div>

        <div id="case-studies" style={{ marginTop: "4rem", display: "flex", flexDirection: "column", gap: "6rem" }}>
          {slices.map((slice, idx) => {
            const title =
              slice.slice_type === "project_films"
                ? "01 — MOTION STUDIES"
                : slice.slice_type === "project_interactive"
                ? "02 — INTERACTIVE"
                : slice.slice_type === "project_gallery"
                ? "03 — GALLERY"
                : "04 — STORY";
            const items = slice.items || [];
            const primaryVideo = (slice.primary?.video_url as string) || "";
            const primaryImage = (slice.primary?.image as { url?: string })?.url;

            return (
              <section key={idx} style={{ borderTop: "1px solid rgba(255,253,226,0.15)", paddingTop: "3.2rem" }}>
                <p style={{ fontSize: "1.3rem", letterSpacing: "0.08em", opacity: 0.7, marginBottom: "2.4rem" }}>
                  {title}
                </p>
                {primaryVideo && (
                  <div style={{ borderRadius: "1.6rem", overflow: "hidden", marginBottom: "2.4rem" }}>
                    <HlsVideo src={primaryVideo} autoPlay={!motionPaused} loop muted />
                  </div>
                )}
                {primaryImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage}
                    alt=""
                    style={{ width: "100%", borderRadius: "1.6rem", marginBottom: "2.4rem" }}
                  />
                )}
                {items.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.4rem" }}>
                    {items.map((item, i) => {
                      const vUrl = item.video_url as string | undefined;
                      const imgUrl = (item.image as { url?: string } | undefined)?.url;
                      return (
                        <div key={i} style={{ borderRadius: "1.6rem", overflow: "hidden", background: "#090b10" }}>
                          {vUrl ? (
                            <HlsVideo src={vUrl} autoPlay={!motionPaused} loop muted />
                          ) : imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgUrl} alt="" style={{ width: "100%", height: "auto" }} />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {slices.length === 0 && heroThumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroThumb} alt={project.data.name || ""} style={{ width: "100%", borderRadius: "1.6rem" }} />
          )}
        </div>
      </div>

      <div className="WorkDetailPage_workDetailPage_backToWorkButton__BFe3Z">
        <TransitionLink href={ROUTES.WORK} className="BackToWorkButton_button__placeholder">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1rem",
              background: "#0b0b0b",
              border: "1px solid rgba(255,253,226,0.2)",
              padding: "1.2rem 2rem",
              borderRadius: "9999px",
              fontSize: "1.4rem",
            }}
          >
            ← Back to work
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}

export default function WorkDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const entry = PROJECTS_MAP[slug];
  const project = entry?.project;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const wheelLockRef = useRef(false);

  const mediaList = useMemo(() => {
    if (!project) return [];
    const list = project.data.media || [];
    const thumb = project.data.card_thumbnail;
    if (thumb?.url) {
      return [{ image: thumb, video_url: "" } as MediaEntry, ...list];
    }
    return list;
  }, [project]);

  const total = mediaList.length;

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((i) => (i + 1) % total);
    setProgress(0);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((i) => (i - 1 + total) % total);
    setProgress(0);
  }, [total]);

  useEffect(() => {
    if (!project || project.data.template === "Web case study") return;
    const onWheel = (e: WheelEvent) => {
      if (infoOpen || wheelLockRef.current || Math.abs(e.deltaY) < 40) return;
      wheelLockRef.current = true;
      if (e.deltaY > 0) goNext();
      else goPrev();
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [project, infoOpen, goNext, goPrev]);

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2rem" }}>
        <p style={{ fontSize: "2.4rem" }}>Project not found</p>
        <TransitionLink href={ROUTES.WORK} className="common-link-effect">
          Back to work
        </TransitionLink>
      </div>
    );
  }

  if (project.data.template === "Web case study") {
    return <WebCaseStudyView project={project} />;
  }

  const currentMedia = mediaList[currentIndex];
  const isVideo = Boolean(currentMedia?.video_url?.trim());

  return (
    <div className="WorkDetailPage_workDetailPage__ffweG">
      <div className="WorkDetailPage_workDetailPage_mediaScene__yHqBY">
        {mediaList.map((m, idx) => {
          const active = idx === currentIndex;
          const vUrl = m.video_url?.trim();
          const iUrl = m.image?.url || m.thumbnail?.url;
          return (
            <div
              key={idx}
              style={{
                position: "fixed",
                inset: 0,
                opacity: active ? 1 : 0,
                pointerEvents: active ? "auto" : "none",
                transition: "opacity 0.9s cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
            >
              {vUrl ? (
                <SlideVideo
                  url={vUrl}
                  active={active}
                  muted={muted}
                  paused={paused}
                  onProgress={setProgress}
                />
              ) : iUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iUrl}
                  alt={project.data.name || ""}
                  className="WorkDetailPage_workDetailPage_mediaScene_image__VGdLk"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <h1
        className={`WorkDetailPage_workDetailPage_name__VaDvj ${
          !infoOpen ? "WorkDetailPage_workDetailPage_name__visible__d8Xvj" : ""
        }`}
      >
        {project.data.name}
      </h1>

      <div className="WorkDetailPage_workDetailPage_backToWorkButton__BFe3Z">
        <TransitionLink href={ROUTES.WORK} className="BackToWorkButton_backToWorkButton__placeholder">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.8rem",
              fontSize: "1.4rem",
              color: "var(--brand-yellow)",
              mixBlendMode: "difference",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/back.svg" alt="Back" style={{ width: "1.6rem", height: "1.6rem" }} />
            Back to work
          </span>
        </TransitionLink>
      </div>

      <div className="WorkDetailPage_workDetailPage_projectInfoButton__7_ebZ">
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          style={{
            fontSize: "1.4rem",
            color: "var(--brand-yellow)",
            mixBlendMode: "difference",
          }}
        >
          Project info +
        </button>
      </div>

      {total > 1 && (
        <div
          style={{
            position: "fixed",
            right: "4.8rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              aria-label={`Slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? "2.4rem" : "1.2rem",
                height: "0.2rem",
                background:
                  idx === currentIndex
                    ? "var(--brand-yellow)"
                    : "rgba(255, 253, 226, 0.35)",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {isVideo && (
        <div
          style={{
            position: "fixed",
            bottom: "3.2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "1.6rem",
            background: "rgba(5, 18, 54, 0.7)",
            backdropFilter: "blur(8px)",
            padding: "0.8rem 1.8rem",
            borderRadius: "9999px",
          }}
        >
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={paused ? "/icons/play.svg" : "/icons/pause.svg"}
              alt={paused ? "Play" : "Pause"}
              style={{ width: "1.4rem", height: "1.4rem" }}
            />
          </button>
          <div
            style={{
              width: "16rem",
              height: "2px",
              background: "rgba(255,253,226,0.25)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--brand-yellow)",
                transformOrigin: "left center",
                transform: `scaleX(${progress})`,
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={muted ? "/icons/mute.svg" : "/icons/unmute.svg"}
              alt={muted ? "Muted" : "Unmuted"}
              style={{ width: "1.4rem", height: "1.4rem" }}
            />
          </button>
        </div>
      )}

      <div
        className={`ProjectInfo_projectInfo__Pm6kE ${
          infoOpen ? "ProjectInfo_projectInfo__visible__Ga0yt" : ""
        }`}
      >
        <div
          className="ProjectInfo_projectInfo_overlay__P6hp6"
          onClick={() => setInfoOpen(false)}
        />
        <div className="ProjectInfo_projectInfo_content__tpGJ4">
          <button
            type="button"
            className="ProjectInfo_hideProjectInfoButton__pIlqD"
            onClick={() => setInfoOpen(false)}
          >
            Close ×
          </button>
          <h2 className="ProjectInfo_projectInfo_content_name__l2lZE">
            {project.data.name}
          </h2>
          <div className="ProjectInfo_projectInfo_content_info__AWE5v">
            {project.data.client && (
              <div className="ProjectInfo_projectInfo_content_info_block__kO7yD">
                <p className="ProjectInfo_projectInfo_content_info_label__HbeJr">Client</p>
                <p className="ProjectInfo_projectInfo_content_info_content__d1RSg">
                  {project.data.client}
                </p>
              </div>
            )}
            {project.data.year && (
              <div className="ProjectInfo_projectInfo_content_info_block__kO7yD">
                <p className="ProjectInfo_projectInfo_content_info_label__HbeJr">Year</p>
                <p className="ProjectInfo_projectInfo_content_info_content__d1RSg">
                  {project.data.year}
                </p>
              </div>
            )}
            {project.data.services_provided && project.data.services_provided.length > 0 && (
              <div className="ProjectInfo_projectInfo_content_info_block__kO7yD">
                <p className="ProjectInfo_projectInfo_content_info_label__HbeJr">Services</p>
                <div className="ProjectInfo_projectInfo_content_info_content__d1RSg">
                  {project.data.services_provided.map((s, i) => (
                    <p key={i}>{s.service}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          {project.data.description && (
            <div className="ProjectInfo_projectInfo_content_description__hzp_c">
              <PrismicRichText field={project.data.description} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
