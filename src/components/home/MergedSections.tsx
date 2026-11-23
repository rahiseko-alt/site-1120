"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Hls from "hls.js";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { TransitionLink } from "@/components/common/TransitionLink";
import { GifPlayer } from "@/components/common/GifPlayer";
import { useViewport } from "@/hooks/usePageLifecycle";
import { ROUTES } from "@/lib/constants";
import workData from "@/data/work.json";
import labData from "@/data/lab.json";
import jobsData from "@/data/jobs.json";

/* ============================================================================
 * 1. INTEGRATED WORK ARCHIVE (#section-work)
 * ============================================================================ */
interface WorkProjectItem {
  id: string;
  uid: string;
  data: {
    name?: string;
    description?: RichTextField;
    card_thumbnail?: { url?: string };
    categories?: Array<{ category?: { uid?: string } }>;
    services_provided?: Array<{ service?: string }>;
  };
}

interface WorkCategoryItem {
  id: string;
  uid: string;
  data: { name?: string };
}

export function IntegratedWorkArchive() {
  const categories = workData.categories as unknown as WorkCategoryItem[];
  const allProjects = workData.projects as unknown as WorkProjectItem[];
  const counts = workData.counts as number[];
  const { isDesktop } = useViewport();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [hoveredUid, setHoveredUid] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!selectedCat) return allProjects;
    return allProjects.filter((p) =>
      p.data.categories?.some((c) => c.category?.uid === selectedCat)
    );
  }, [allProjects, selectedCat]);

  return (
    <section
      id="section-work"
      className="Container_container__A7FAx"
      style={{
        paddingTop: isDesktop ? "14rem" : "10rem",
        paddingBottom: isDesktop ? "14rem" : "10rem",
        position: "relative",
        zIndex: 2,
        color: "var(--brand-yellow)",
        overflow: "hidden",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "2.4rem",
          borderBottom: "1px solid rgba(242, 239, 233, 0.18)",
          paddingBottom: "3.2rem",
          marginBottom: isDesktop ? "5.6rem" : "3.6rem",
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
              marginBottom: "1rem",
            }}
          >
            02 // Complete Works Archive
          </span>
          <h2
            style={{
              fontSize: "clamp(3.2rem, 5.2vw, 7.6rem)",
              fontWeight: 600,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
            }}
          >
            Selected &amp; Archived Productions
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.8rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            style={{
              padding: "0.8rem 1.6rem",
              borderRadius: "999px",
              fontSize: "1.25rem",
              fontWeight: 500,
              border: "1px solid",
              borderColor: !selectedCat
                ? "var(--brand-accent)"
                : "rgba(242, 239, 233, 0.22)",
              background: !selectedCat
                ? "var(--brand-accent)"
                : "rgba(242, 239, 233, 0.04)",
              color: "var(--brand-yellow)",
              transition: "all 0.25s ease",
            }}
          >
            All ({counts[0] ?? allProjects.length})
          </button>
          {categories.map((cat, idx) => {
            const active = selectedCat === cat.uid;
            return (
              <button
                key={cat.uid}
                type="button"
                onClick={() => setSelectedCat(cat.uid)}
                style={{
                  padding: "0.8rem 1.6rem",
                  borderRadius: "999px",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor: active
                    ? "var(--brand-accent)"
                    : "rgba(242, 239, 233, 0.22)",
                  background: active
                    ? "var(--brand-accent)"
                    : "rgba(242, 239, 233, 0.04)",
                  color: "var(--brand-yellow)",
                  transition: "all 0.25s ease",
                }}
              >
                {cat.data.name} ({counts[idx + 1] ?? 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Staggered Grid (2 cols desktop, 1 col mobile) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "repeat(2, minmax(0, 1fr))" : "1fr",
          gap: isDesktop ? "5.2rem 4.8rem" : "4rem",
        }}
      >
        {filteredProjects.map((proj, idx) => {
          const isDimmed = hoveredUid !== null && hoveredUid !== proj.uid;
          const isHovered = hoveredUid === proj.uid;
          return (
            <TransitionLink
              key={proj.uid}
              href={`${ROUTES.WORK}/${proj.uid}`}
              pageName="WorkDetail"
              onMouseEnter={() => setHoveredUid(proj.uid)}
              onMouseLeave={() => setHoveredUid(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.4rem",
                marginTop: isDesktop && idx % 2 === 1 ? "6rem" : "0",
                opacity: isDimmed ? 0.38 : 1,
                transform: isHovered ? "translateY(-0.5rem)" : "translateY(0)",
                transition: "all 0.45s cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "504 / 520",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  border: "1px solid rgba(242, 239, 233, 0.14)",
                  background: "rgba(242, 239, 233, 0.03)",
                }}
              >
                {proj.data.card_thumbnail?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proj.data.card_thumbnail.url}
                    alt={proj.data.name || ""}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transition: "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1.6rem",
                }}
              >
                <h3
                  style={{
                    fontSize: isDesktop ? "2.6rem" : "2.2rem",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {proj.data.name}
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "1.4rem",
                    color: "var(--brand-accent)",
                    flexShrink: 0,
                  }}
                >
                  Case Study ↗
                </span>
              </div>

              {proj.data.services_provided && proj.data.services_provided.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {proj.data.services_provided.slice(0, 3).map((s, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: "1.1rem",
                        padding: "0.3rem 1rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(242, 239, 233, 0.18)",
                        opacity: 0.78,
                      }}
                    >
                      {s.service}
                    </span>
                  ))}
                </div>
              )}
            </TransitionLink>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
 * 2. INTEGRATED SERVICES CONSULTANCY MATRIX (#section-services)
 * ============================================================================ */
const SERVICE_PILLARS = [
  {
    id: "strategy",
    index: "01",
    title: "Strategy & Consulting",
    body: "We help brands figure out what to build, what to say, and where to say it. Our strategists work alongside founders and CMOs on brand positioning, market entry into Asia, cross-cultural adaptation for Asian brands going global, and the AI-era questions that no playbook has answered yet.",
    capabilities: [
      "Brand strategy",
      "Creative consulting",
      "Market entry (East ↔ West)",
      "Cultural and audience research",
      "AI strategy for brand and marketing teams",
      "Naming and verbal identity",
      "Positioning and messaging",
      "Go-to-market creative",
    ],
  },
  {
    id: "design",
    index: "02",
    title: "Design & Product",
    body: "Digital product work for brands that need their UX to match the craft of their identity. We design websites, flagship digital experiences, ecommerce journeys, and product interfaces — end to end, from research and IA through interaction design, prototypes, and design systems.",
    capabilities: [
      "UI/UX design",
      "Digital product design",
      "Web experiences and flagships",
      "Ecommerce and storefront design",
      "Interaction and motion design",
      "Design systems",
      "Prototyping and testing",
      "Accessibility and performance",
    ],
  },
  {
    id: "brand",
    index: "03",
    title: "Brand & Direction",
    body: "The artist-led craft the studio is known for. We build brand identities from scratch, direct campaigns, and produce commercials, CGI, and image-making for luxury, beauty, fashion, and culture clients. AI is a tool in our process, not a substitute for taste.",
    capabilities: [
      "Brand identity",
      "Art direction",
      "Design concept",
      "Commercials and campaign films",
      "CGI and 3D",
      "Photography direction",
      "Music video and film",
      "Content systems",
    ],
  },
  {
    id: "experiential",
    index: "04",
    title: "Experiential & Offline",
    body: "The work AI cannot replace — physical, in the room, attended by humans. We design immersive launches, retail concepts, interactive installations, and out-of-home campaigns that turn cultural moments into places people show up to.",
    capabilities: [
      "Immersive events and launches",
      "Interactive art installations",
      "Retail and pop-up design",
      "Out-of-home and outdoor",
      "Experiential campaigns",
      "Exhibition and showroom design",
      "Print and editorial",
      "Merchandise and collectibles",
    ],
  },
];

export function IntegratedServicesSection() {
  const [activePillar, setActivePillar] = useState(0);
  const { isDesktop } = useViewport();

  return (
    <section
      id="section-services"
      className="Container_container__A7FAx"
      style={{
        paddingTop: isDesktop ? "8rem" : "4rem",
        paddingBottom: isDesktop ? "14rem" : "10rem",
        position: "relative",
        zIndex: 2,
        color: "var(--brand-yellow)",
        overflow: "hidden",
      }}
    >
      {/* Intro Block */}
      <div
        style={{
          maxWidth: "100rem",
          marginBottom: isDesktop ? "7.2rem" : "4.8rem",
          borderLeft: "2px solid var(--brand-accent)",
          paddingLeft: isDesktop ? "3.2rem" : "2rem",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--brand-accent)",
            fontWeight: 600,
            marginBottom: "1.6rem",
          }}
        >
          04 // Consultancy &amp; Brief Initiation
        </div>
        <h2
          style={{
            fontSize: "clamp(3.2rem, 4.8vw, 6.8rem)",
            fontWeight: 600,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            marginBottom: "2.4rem",
          }}
        >
          A creative practice and consultancy, architected for the AI era.
        </h2>
        <p
          style={{
            fontSize: isDesktop ? "2rem" : "1.65rem",
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            maxWidth: "74rem",
          }}
        >
          Partnering with global brands across strategy, digital product, brand direction, and
          experiential work from four studios — Saigon, Hong Kong, Tokyo, and Paris.
        </p>
      </div>

      {/* Pillar Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "4rem",
        }}
      >
        {SERVICE_PILLARS.map((pillar, idx) => {
          const isActive = activePillar === idx;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActivePillar(idx)}
              style={{
                padding: isDesktop ? "1.2rem 2.2rem" : "0.9rem 1.4rem",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: isActive
                  ? "var(--brand-accent)"
                  : "rgba(242, 239, 233, 0.2)",
                background: isActive
                  ? "var(--brand-accent)"
                  : "rgba(242, 239, 233, 0.03)",
                color: "var(--brand-yellow)",
                fontSize: isDesktop ? "1.4rem" : "1.25rem",
                fontWeight: 600,
                transition: "all 0.3s ease",
              }}
            >
              {pillar.index} — {pillar.title}
            </button>
          );
        })}
      </div>

      {/* Active Pillar Detail Matrix */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr 1.6fr" : "1fr",
          gap: isDesktop ? "6rem" : "3.2rem",
          padding: isDesktop ? "4.8rem" : "2.8rem",
          borderRadius: "0.8rem",
          border: "1px solid rgba(242, 239, 233, 0.16)",
          background: "rgba(242, 239, 233, 0.03)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "1.2rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--brand-accent)",
              fontWeight: 600,
              display: "block",
              marginBottom: "1.2rem",
            }}
          >
            Pillar // {SERVICE_PILLARS[activePillar].index}
          </span>
          <h3
            style={{
              fontSize: "clamp(2.6rem, 3.4vw, 4.4rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              marginBottom: "2rem",
            }}
          >
            {SERVICE_PILLARS[activePillar].title}
          </h3>
          <p
            style={{
              fontSize: isDesktop ? "1.7rem" : "1.55rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            {SERVICE_PILLARS[activePillar].body}
          </p>
        </div>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(2, 1fr)" : "1fr",
            gap: "0 3.2rem",
            alignContent: "start",
            borderTop: "1px solid rgba(242, 239, 233, 0.15)",
          }}
        >
          {SERVICE_PILLARS[activePillar].capabilities.map((cap) => (
            <li
              key={cap}
              style={{
                padding: "1.6rem 0",
                borderBottom: "1px solid rgba(242, 239, 233, 0.15)",
                fontSize: isDesktop ? "1.6rem" : "1.45rem",
                fontWeight: 500,
              }}
            >
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
 * 3. INTEGRATED LAB SECTION (#section-lab) — Non-conflicting Infinite Carousel
 *    + Interactive Running Character LZW Decoder
 * ============================================================================ */
interface LabItem {
  id: string;
  uid: string;
  data: {
    title?: string;
    use_video?: boolean;
    mux_id?: string;
    video_url?: string;
    thumbnail?: { url?: string };
  };
}

function extractMuxId(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) {
    try {
      const seg = new URL(trimmed).pathname.split("/")[1];
      return seg ? seg.replace(/\.m3u8$/i, "") || null : null;
    } catch {
      return null;
    }
  }
  return trimmed.replace(/\.m3u8$/i, "");
}

function getLabMedia(item: LabItem) {
  const muxId = extractMuxId(item.data.mux_id);
  const rawVideoUrl =
    item.data.use_video === true
      ? muxId
        ? `https://stream.mux.com/${muxId}.m3u8`
        : item.data.video_url?.trim() || null
      : null;
  const videoUrl = rawVideoUrl?.includes(".mux.com")
    ? `/api/mux?url=${encodeURIComponent(rawVideoUrl)}`
    : rawVideoUrl;
  const posterUrl =
    item.data.thumbnail?.url ||
    (muxId ? `https://image.mux.com/${muxId}/thumbnail.jpg` : "/images/test.jpg");
  return { videoUrl, posterUrl };
}

const SIM_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SIM_FRAG = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uDissipation;
  uniform float uBrushRadius;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vec2 texelSize = vec2(1.0 / 64.0);
    vec2 current = texture2D(uTexture, vUv).xy;
    float left   = texture2D(uTexture, vUv + vec2(-texelSize.x, 0.0)).r;
    float right  = texture2D(uTexture, vUv + vec2(texelSize.x, 0.0)).r;
    float top    = texture2D(uTexture, vUv + vec2(0.0, -texelSize.y)).r;
    float bottom = texture2D(uTexture, vUv + vec2(0.0, texelSize.y)).r;
    float average = (left + right + top + bottom) * 0.25;
    current.y += (average - current.r) * 0.5;
    current.y *= uDissipation;
    current.r += current.y;
    float distMouse = distance(vUv, uMouse);
    float brushMouse = smoothstep(uBrushRadius, 0.0, distMouse);
    current.r += brushMouse * uVelocity;
    current.r *= 0.98;
    current.y *= 0.98;
    gl_FragColor = vec4(clamp(current.r, -5.0, 5.0), clamp(current.y, -5.0, 5.0), 0.0, 1.0);
  }
`;

const LAB_VERT = `
  precision mediump float;
  uniform float uVelo;
  uniform sampler2D uDisplacementMap;
  uniform float uVertexStrength;
  uniform vec2 uMeshSize;
  varying vec2 vUv;
  #define M_PI 3.1415926535897932384626433832795
  void main() {
    vec3 pos = position;
    float curvature = (sin(uv.y * M_PI) * uVelo) * 0.1;
    pos.x += curvature / (max(uMeshSize.x, 1.0) * 0.0012);
    float mouseDisp = texture2D(uDisplacementMap, uv).r;
    pos.z += mouseDisp * uVertexStrength;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const LAB_FRAG = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacementMap;
  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;
  uniform float uDistortionStrength;
  varying vec2 vUv;

  vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / max(screenSize.y, 1.0);
    float imageRatio = imageSize.x / max(imageSize.y, 1.0);
    vec2 newSize = screenRatio < imageRatio
        ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y)
        : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    vec2 newOffset = (screenRatio < imageRatio
        ? vec2((newSize.x - screenSize.x) / 2.0, 0.0)
        : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
  }

  void main() {
    vec2 uv = vUv;
    vec2 texUv = uImageSize.x > 0.0 && uImageSize.y > 0.0
        ? backgroundCoverUv(uMeshSize, uImageSize, uv)
        : uv;
    vec2 texelSize = vec2(1.0 / 64.0);
    float hL = texture2D(uDisplacementMap, uv - vec2(texelSize.x, 0.0)).r;
    float hR = texture2D(uDisplacementMap, uv + vec2(texelSize.x, 0.0)).r;
    float hT = texture2D(uDisplacementMap, uv - vec2(0.0, texelSize.y)).r;
    float hB = texture2D(uDisplacementMap, uv + vec2(0.0, texelSize.y)).r;
    vec2 mouseNormalOffset = vec2(hL - hR, hT - hB);
    vec2 distortion = mouseNormalOffset * uDistortionStrength;
    vec4 texture = texture2D(uTexture, texUv + distortion);
    texture.rgb *= clamp(1.0 - length(mouseNormalOffset) * 0.55, 0.65, 1.0);
    gl_FragColor = texture;
  }
`;

function LabCarouselMesh({
  index,
  total,
  item,
  scrollRef,
  veloRef,
  mouseRef,
  dragDistRef,
  containerRef,
  onOpenModal,
}: {
  index: number;
  total: number;
  item: LabItem;
  scrollRef: React.RefObject<number>;
  veloRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  dragDistRef: React.RefObject<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onOpenModal: (index: number) => void;
}) {
  const { posterUrl } = useMemo(() => getLabMedia(item), [item]);
  const fallbackTex = useTexture(posterUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const prevMouseUv = useRef(new THREE.Vector2(0.5, 0.5));

  const fboSettings = useMemo(
    () => ({
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }),
    []
  );
  const fboA = useFBO(64, 64, fboSettings);
  const fboB = useFBO(64, 64, fboSettings);
  const currentFbo = useRef(fboA);
  const simScene = useMemo(() => new THREE.Scene(), []);
  const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  const simUniforms = useMemo(
    () => ({
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDissipation: { value: 0.97 },
      uBrushRadius: { value: 0.06 },
      uVelocity: { value: 0 },
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTexture: { value: fallbackTex },
      uDisplacementMap: { value: fboA.texture },
      uMeshSize: { value: new THREE.Vector2(360, 460) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uVelo: { value: 0 },
      uDistortionStrength: { value: 0.18 },
      uVertexStrength: { value: 12 },
    }),
    [fallbackTex, fboA]
  );

  useEffect(() => {
    if (fallbackTex?.image) {
      const img = fallbackTex.image as HTMLImageElement;
      if (img.naturalWidth && img.naturalHeight) {
        uniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
      }
    }
  }, [fallbackTex, uniforms]);

  useFrame(({ gl, size }) => {
    if (!meshRef.current || !matRef.current) return;
    const w = size.width;
    const h = size.height;
    const cardW = Math.min(400, Math.max(220, w * 0.25));
    const cardH = Math.min(h * 0.88, cardW * 1.24);
    const gap = 28;
    const stride = cardW + gap;
    const totalW = stride * total;

    let x = ((index * stride - scrollRef.current) % totalW + totalW) % totalW;
    if (x > totalW / 2) x -= totalW;

    meshRef.current.position.set(x, 0, 0);
    meshRef.current.scale.set(cardW, cardH, 1);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const localMx = mouseRef.current.x - rect.left - w / 2;
      const localMy = -(mouseRef.current.y - rect.top - h / 2);
      const u = (localMx - (x - cardW / 2)) / cardW;
      const v = (localMy - -cardH / 2) / cardH;
      const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;

      if (inside) {
        const dx = u - prevMouseUv.current.x;
        const dy = v - prevMouseUv.current.y;
        simUniforms.uMouse.value.set(u, v);
        simUniforms.uVelocity.value = Math.min(Math.hypot(dx, dy) * 14, 1.4);
        prevMouseUv.current.set(u, v);
      } else {
        simUniforms.uVelocity.value = 0;
      }
    }

    const readFbo = currentFbo.current;
    const writeFbo = readFbo === fboA ? fboB : fboA;
    simUniforms.uTexture.value = readFbo.texture;
    gl.setRenderTarget(writeFbo);
    gl.render(simScene, simCam);
    gl.setRenderTarget(null);
    currentFbo.current = writeFbo;

    matRef.current.uniforms.uDisplacementMap.value = writeFbo.texture;
    matRef.current.uniforms.uMeshSize.value.set(cardW, cardH);
    matRef.current.uniforms.uVelo.value = veloRef.current;
  });

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={() => {
          if (dragDistRef.current <= 8) onOpenModal(index);
        }}
      >
        <planeGeometry args={[1, 1, 24, 24]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={LAB_VERT}
          fragmentShader={LAB_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            vertexShader={SIM_VERT}
            fragmentShader={SIM_FRAG}
            uniforms={simUniforms}
          />
        </mesh>,
        simScene
      )}
    </>
  );
}

export function IntegratedLabSection() {
  const rawLabs = (labData as { labs: LabItem[] }).labs;
  const labs = useMemo(
    () =>
      rawLabs.filter((l) => {
        const { videoUrl, posterUrl } = getLabMedia(l);
        return Boolean(videoUrl || posterUrl);
      }),
    [rawLabs]
  );

  const { isDesktop } = useViewport();
  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);
  const carouselWrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const veloRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    if (!isDesktop) return;
    let rafId = 0;
    const tick = () => {
      // Gentle continuous drift when not dragging or hovering
      if (!isDraggingRef.current && !isHoveredRef.current) {
        targetScrollRef.current += 0.45;
      }
      const diff = targetScrollRef.current - scrollRef.current;
      scrollRef.current += diff * 0.1;
      veloRef.current = Math.max(-1.8, Math.min(1.8, diff * 0.014));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isDesktop]);

  const nudgeCarousel = useCallback((delta: number) => {
    targetScrollRef.current += delta;
  }, []);

  const modalItem = activeModalIdx !== null ? labs[activeModalIdx] : null;
  const modalMedia = modalItem ? getLabMedia(modalItem) : null;

  return (
    <section
      id="section-lab"
      style={{
        paddingTop: isDesktop ? "12rem" : "9rem",
        paddingBottom: isDesktop ? "12rem" : "9rem",
        position: "relative",
        zIndex: 2,
        color: "var(--brand-dark-blue)",
        overflow: "hidden",
      }}
    >
      {/* Header + Interactive GifPlayer LZW Sprite Engine */}
      <div className="Container_container__A7FAx">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "2.4rem",
            borderBottom: "1px solid rgba(8, 9, 12, 0.16)",
            paddingBottom: "3.2rem",
            marginBottom: "4rem",
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
                marginBottom: "1rem",
              }}
            >
              07 // R&amp;D Visual Laboratory
            </span>
            <h2
              style={{
                fontSize: "clamp(3.2rem, 5.2vw, 7.6rem)",
                fontWeight: 600,
                lineHeight: 0.94,
                letterSpacing: "-0.035em",
              }}
            >
              Experiments &amp; Motion Studies
            </h2>
          </div>

          {/* Upgraded Binary LZW GIF Sprite Engine Widget (transferred from loader) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.6rem",
              background: "rgba(8, 9, 12, 0.05)",
              backdropFilter: "blur(8px)",
              padding: "1rem 2rem 1rem 1.2rem",
              borderRadius: "1.6rem",
              border: "1px solid rgba(8, 9, 12, 0.14)",
              maxWidth: "100%",
            }}
          >
            <div style={{ width: "4.8rem", height: "4.8rem", overflow: "hidden", flexShrink: 0 }}>
              <GifPlayer
                src="/images/loading.gif"
                interactiveMouse={true}
                className="PageLoader_pageLoader_gifImg__D7UIb"
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--brand-accent)",
                }}
              >
                EXP.00 — BINARY GIF FRAME ENGINE
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontFamily: "var(--font-herbik)",
                  fontStyle: "italic",
                  opacity: 0.8,
                }}
              >
                Real-time LZW decompression reacting to cursor velocity
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Non-conflicting WebGL Infinite Horizontal Carousel */}
      {isDesktop ? (
        <div style={{ position: "relative" }}>
          <div
            ref={carouselWrapRef}
            onPointerEnter={() => {
              isHoveredRef.current = true;
            }}
            onPointerDown={(e) => {
              isDraggingRef.current = true;
              dragStartXRef.current = e.clientX;
              dragStartScrollRef.current = targetScrollRef.current;
              dragDistRef.current = 0;
            }}
            onPointerMove={(e) => {
              mouseRef.current = { x: e.clientX, y: e.clientY };
              if (!isDraggingRef.current) return;
              const dx = dragStartXRef.current - e.clientX;
              dragDistRef.current = Math.abs(dx);
              targetScrollRef.current = dragStartScrollRef.current + dx * 1.4;
            }}
            onPointerUp={() => {
              isDraggingRef.current = false;
            }}
            onPointerLeave={() => {
              isDraggingRef.current = false;
              isHoveredRef.current = false;
            }}
            style={{
              width: "100%",
              height: "58svh",
              minHeight: "42rem",
              cursor: "grab",
              position: "relative",
            }}
          >
            <Canvas
              orthographic
              camera={{ position: [0, 0, 100], zoom: 1, near: -1000, far: 1000 }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={1} />
              <Suspense fallback={null}>
                {labs.map((item, idx) => (
                  <LabCarouselMesh
                    key={item.id}
                    index={idx}
                    total={labs.length}
                    item={item}
                    scrollRef={scrollRef}
                    veloRef={veloRef}
                    mouseRef={mouseRef}
                    dragDistRef={dragDistRef}
                    containerRef={carouselWrapRef}
                    onOpenModal={(i) => setActiveModalIdx(i)}
                  />
                ))}
              </Suspense>
            </Canvas>
          </div>

          <div
            className="Container_container__A7FAx"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2.4rem",
            }}
          >
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                onClick={() => nudgeCarousel(-420)}
                style={{
                  padding: "0.8rem 1.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(8, 9, 12, 0.25)",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => nudgeCarousel(420)}
                style={{
                  padding: "0.8rem 1.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(8, 9, 12, 0.25)",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
            <span
              style={{
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                fontSize: "1.4rem",
                opacity: 0.75,
              }}
            >
              Drag horizontally or click any study to inspect →
            </span>
          </div>
        </div>
      ) : (
        /* Mobile: Clean Horizontal Snap Strip (no vertical scroll lock!) */
        <div
          style={{
            display: "flex",
            gap: "1.6rem",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingLeft: "var(--padding-x)",
            paddingRight: "var(--padding-x)",
            paddingBottom: "1rem",
          }}
        >
          {labs.map((item, idx) => {
            const { posterUrl } = getLabMedia(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModalIdx(idx)}
                style={{
                  flex: "0 0 74vw",
                  aspectRatio: "4 / 5",
                  borderRadius: "0.6rem",
                  overflow: "hidden",
                  position: "relative",
                  scrollSnapAlign: "center",
                  border: "1px solid rgba(8, 9, 12, 0.14)",
                  background: "#08090c",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={item.data.title || `Lab study ${idx + 1}`}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Modal Viewer */}
      {modalItem && modalMedia && (
        <LabMediaModal
          videoUrl={modalMedia.videoUrl}
          posterUrl={modalMedia.posterUrl}
          title={modalItem.data.title || ""}
          onClose={() => setActiveModalIdx(null)}
        />
      )}
    </section>
  );
}

function LabMediaModal({
  videoUrl,
  posterUrl,
  title,
  onClose,
}: {
  videoUrl: string | null;
  posterUrl: string;
  title: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    let hls: Hls | null = null;
    if (videoUrl.includes(".m3u8")) {
      if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = videoUrl;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.attachMedia(el);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls?.loadSource(videoUrl));
      }
    } else {
      el.src = videoUrl;
    }
    return () => hls?.destroy();
  }, [videoUrl]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        backgroundColor: "rgba(8, 9, 12, 0.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3.2rem",
      }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed",
          top: "3.2rem",
          right: "var(--padding-x)",
          color: "var(--brand-yellow)",
          fontSize: "1.5rem",
          padding: "0.8rem 1.8rem",
          borderRadius: "999px",
          border: "1px solid rgba(242, 239, 233, 0.3)",
          background: "rgba(8, 9, 12, 0.7)",
        }}
      >
        Close ×
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "85vw", maxHeight: "80vh" }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            poster={posterUrl}
            controls
            autoPlay
            loop
            playsInline
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "0.4rem" }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={title}
            style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "0.4rem" }}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. INTEGRATED JOBS SECTION (#section-jobs)
 * ============================================================================ */
interface CareerItemData {
  role?: string;
  type?: string;
  location?: string;
  poster?: {
    url?: string;
    alt?: string;
    dimensions?: { width: number; height: number };
  };
  description?: RichTextField;
}

export function IntegratedJobsSection() {
  const data = jobsData as unknown as {
    heading?: string;
    hidden?: boolean;
    slices?: Array<{
      slice_type: string;
      primary?: { list?: Array<{ item: { uid?: string; data?: CareerItemData } }> };
    }>;
  };
  const { isDesktop } = useViewport();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const careerSlice = data.slices?.find((s) => s.slice_type === "career_list");
  const list = careerSlice?.primary?.list ?? [];

  if (data.hidden || list.length === 0) return null;

  return (
    <section
      id="section-jobs"
      className="Container_container__A7FAx"
      style={{
        paddingTop: isDesktop ? "12rem" : "9rem",
        paddingBottom: isDesktop ? "10rem" : "7rem",
        position: "relative",
        zIndex: 2,
        color: "var(--brand-yellow)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "2.4rem",
          borderBottom: "1px solid rgba(242, 239, 233, 0.18)",
          paddingBottom: "3.2rem",
          marginBottom: "4rem",
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
              marginBottom: "1rem",
            }}
          >
            09 // Open Positions &amp; Collective
          </span>
          <h2
            style={{
              fontSize: "clamp(3.2rem, 5.2vw, 7.6rem)",
              fontWeight: 600,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
            }}
          >
            {data.heading ?? "Join Our Team"}
          </h2>
        </div>

        {/* Interactive Sprite Runner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.8rem",
            padding: "1.2rem 2rem",
            borderRadius: "1.6rem",
            border: "1px solid rgba(242, 239, 233, 0.18)",
            background: "rgba(242, 239, 233, 0.04)",
            maxWidth: "100%",
          }}
        >
          <div style={{ width: "5.2rem", height: "5.2rem", overflow: "hidden", flexShrink: 0 }}>
            <GifPlayer
              src="/images/loading.gif"
              interactiveMouse={true}
              speedMultiplier={1.25}
              className="PageLoader_pageLoader_gifImg__D7UIb"
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "1rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--brand-accent)",
                fontWeight: 700,
                marginBottom: "0.3rem",
              }}
            >
              Interactive Sprite Engine
            </div>
            <div
              style={{
                fontSize: "1.3rem",
                fontFamily: "var(--font-herbik)",
                fontStyle: "italic",
                opacity: 0.82,
              }}
            >
              Seeking makers who run ahead of the brief.
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Rows */}
      <div style={{ borderTop: "1px solid rgba(242, 239, 233, 0.16)" }}>
        {list.map((entry, idx) => {
          const row = entry.item?.data;
          if (!row) return null;
          const isOpen = expandedIdx === idx;
          return (
            <div
              key={entry.item?.uid || idx}
              style={{
                borderBottom: "1px solid rgba(242, 239, 233, 0.16)",
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "4rem 1.8fr 1fr 1fr 3rem" : "2.4rem 1fr 2.4rem",
                  gap: "1.6rem",
                  alignItems: "center",
                  padding: "2.4rem 0",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1.3rem", opacity: 0.55 }}>0{idx + 1}</span>
                <span
                  style={{
                    fontSize: isDesktop ? "2.4rem" : "1.8rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {row.role}
                </span>
                {isDesktop && (
                  <span style={{ fontSize: "1.4rem", opacity: 0.75 }}>{row.type}</span>
                )}
                {isDesktop && (
                  <span style={{ fontSize: "1.4rem", opacity: 0.75 }}>{row.location}</span>
                )}
                <span
                  style={{
                    fontSize: "2rem",
                    textAlign: "right",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    color: "var(--brand-accent)",
                  }}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      isDesktop && row.poster?.url ? "28rem 1fr" : "1fr",
                    gap: "3.2rem",
                    paddingBottom: "3.6rem",
                    paddingLeft: isDesktop ? "5.6rem" : "0",
                  }}
                >
                  {row.poster?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.poster.url}
                      alt={row.poster.alt || row.role || ""}
                      style={{
                        width: "100%",
                        maxWidth: "28rem",
                        borderRadius: "0.4rem",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "1.55rem",
                      lineHeight: 1.65,
                      color: "var(--text-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                    }}
                  >
                    {!isDesktop && (row.type || row.location) && (
                      <div style={{ fontSize: "1.3rem", color: "var(--brand-accent)" }}>
                        {[row.type, row.location].filter(Boolean).join(" · ")}
                      </div>
                    )}
                    {row.description && (
                      <PrismicRichText
                        field={row.description}
                        components={{
                          hyperlink: ({ node, children }) => (
                            <a
                              href={(node.data as { url?: string }).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="common-link-effect"
                              style={{ color: "var(--brand-yellow)", fontWeight: 600 }}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
