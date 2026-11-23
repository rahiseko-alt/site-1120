"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import Hls from "hls.js";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { GifPlayer } from "@/components/common/GifPlayer";
import { useRouterTransition } from "@/hooks/usePageLifecycle";
import { ROUTES } from "@/lib/constants";
import workData from "@/data/work.json";
import labData from "@/data/lab.json";
import jobsData from "@/data/jobs.json";

// ============================================================================
// 1. INTEGRATED WORK ARCHIVE SECTION (Category Filter + Interactive WebGL/Grid)
// ============================================================================

interface WorkProjectItem {
  id: string;
  uid: string;
  data: {
    name?: string;
    template?: string;
    description?: RichTextField;
    card_thumbnail?: { url?: string };
    categories?: Array<{ category?: { uid?: string } }>;
  };
}

interface CategoryItem {
  id: string;
  uid: string;
  data: { name?: string };
}

export function IntegratedWorkArchive() {
  const categories = workData.categories as unknown as CategoryItem[];
  const allProjects = workData.projects as unknown as WorkProjectItem[];
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [hoveredUid, setHoveredUid] = useState<string | null>(null);
  const { routerPrefetch } = useRouterTransition();

  const filteredProjects = useMemo(() => {
    if (!selectedCat) return allProjects;
    return allProjects.filter((p) =>
      p.data.categories?.some((c) => c.category?.uid === selectedCat)
    );
  }, [allProjects, selectedCat]);

  return (
    <div
      id="section-work"
      className="Container_container__A7FAx"
      style={{
        paddingTop: "14rem",
        paddingBottom: "14rem",
        position: "relative",
      }}
    >
      {/* Section Header & Interactive Category Filter Pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "3.2rem",
          borderBottom: "1px solid rgba(242, 239, 233, 0.18)",
          paddingBottom: "3.2rem",
          marginBottom: "6.4rem",
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
            02 // Complete Works Matrix ({filteredProjects.length})
          </span>
          <h2
            style={{
              fontSize: "clamp(3.6rem, 5.2vw, 7.6rem)",
              fontWeight: 600,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
            }}
          >
            Index of Productions
          </h2>
        </div>

        {/* Category Filter Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            style={{
              padding: "0.9rem 2rem",
              borderRadius: "999px",
              fontSize: "1.3rem",
              fontWeight: 500,
              border: "1px solid",
              borderColor: !selectedCat
                ? "var(--brand-accent)"
                : "rgba(242, 239, 233, 0.22)",
              background: !selectedCat
                ? "var(--brand-accent)"
                : "rgba(242, 239, 233, 0.04)",
              color: "var(--brand-yellow)",
              transition: "all 0.3s ease",
            }}
          >
            All ({allProjects.length})
          </button>
          {categories.map((cat) => {
            const active = selectedCat === cat.uid;
            return (
              <button
                key={cat.uid}
                type="button"
                onClick={() => setSelectedCat(cat.uid)}
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "999px",
                  fontSize: "1.3rem",
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor: active
                    ? "var(--brand-accent)"
                    : "rgba(242, 239, 233, 0.22)",
                  background: active
                    ? "var(--brand-accent)"
                    : "rgba(242, 239, 233, 0.04)",
                  color: "var(--brand-yellow)",
                  transition: "all 0.3s ease",
                }}
              >
                {cat.data.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Staggered Asymmetric 2-Column Interactive Project Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: "4.8rem 3.6rem",
          alignItems: "start",
        }}
      >
        {filteredProjects.map((proj, idx) => {
          const isHovered = hoveredUid === proj.uid;
          const isDimmed = hoveredUid !== null && hoveredUid !== proj.uid;

          return (
            <div
              key={proj.uid}
              onClick={() =>
                routerPrefetch({
                  pathName: `${ROUTES.WORK}/${proj.uid}`,
                  pageName: "WorkDetail",
                })
              }
              onMouseEnter={() => setHoveredUid(proj.uid)}
              onMouseLeave={() => setHoveredUid(null)}
              style={{
                cursor: "pointer",
                marginTop: idx % 2 === 1 ? "4.8rem" : "0",
                opacity: isDimmed ? 0.32 : 1,
                filter: isDimmed ? "grayscale(80%) blur(2px)" : "none",
                transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.55s cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/11",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  background: "#121318",
                  border: "1px solid rgba(242, 239, 233, 0.14)",
                  marginBottom: "1.8rem",
                }}
              >
                {proj.data.card_thumbnail?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proj.data.card_thumbnail.url}
                    alt={proj.data.name || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: isHovered ? "scale(1.06)" : "scale(1)",
                      transition: "transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)",
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "1.4rem",
                    left: "1.4rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "999px",
                    background: "rgba(8, 9, 12, 0.75)",
                    backdropFilter: "blur(8px)",
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                  }}
                >
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
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
                    fontSize: "clamp(2.2rem, 2.4vw, 3.2rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {proj.data.name}
                </h3>
                <span
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--brand-accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    flexShrink: 0,
                  }}
                >
                  Case Study ↗
                </span>
              </div>

              {proj.data.description && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "1.4rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <PrismicRichText field={proj.data.description} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 2. INTEGRATED SERVICES & CAPABILITIES MATRIX (Merged from /services)
// ============================================================================

const SERVICE_PILLARS = [
  {
    id: "strategy",
    index: "01",
    title: "Strategy & Consulting",
    body: "We help brands figure out what to build, what to say, and where to say it. Our strategists work alongside founders and CMOs on brand positioning, market entry into Asia, cross-cultural adaptation, and AI-era creative architecture.",
    capabilities: [
      "Brand strategy",
      "Creative consulting",
      "Market entry (East ↔ West)",
      "Cultural & audience research",
      "AI strategy for brand teams",
      "Naming & verbal identity",
      "Positioning & messaging",
      "Go-to-market creative",
    ],
  },
  {
    id: "design",
    index: "02",
    title: "Design & Digital Product",
    body: "Digital product work for brands that need their UX to match the craft of their identity. We design flagship web experiences, ecommerce journeys, and product interfaces from research through design systems.",
    capabilities: [
      "UI/UX design",
      "Digital product design",
      "WebGL flagships & experiences",
      "Ecommerce & storefront design",
      "Interaction & motion design",
      "Design systems",
      "Prototyping & testing",
      "Accessibility & performance",
    ],
  },
  {
    id: "brand",
    index: "03",
    title: "Brand & Art Direction",
    body: "The artist-led craft the studio is known for. We build brand identities from scratch, direct campaigns, and produce commercials, CGI, and image-making for luxury, beauty, fashion, and culture clients.",
    capabilities: [
      "Brand identity",
      "Art direction",
      "Design concept",
      "Commercials & campaign films",
      "CGI & real-time 3D",
      "Photography direction",
      "Music video & film",
      "Content systems",
    ],
  },
  {
    id: "experiential",
    index: "04",
    title: "Experiential & Spatial",
    body: "The work AI cannot replace — physical, in the room, attended by humans. We design immersive launches, retail concepts, interactive installations, and out-of-home campaigns that turn cultural moments into places people show up to.",
    capabilities: [
      "Immersive events & launches",
      "Interactive art installations",
      "Retail & pop-up design",
      "Out-of-home & billboard",
      "Experiential campaigns",
      "Exhibition & showroom design",
      "Print & editorial",
      "Merchandise & collectibles",
    ],
  },
];

export function IntegratedServicesSection() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div
      id="section-services"
      className="Container_container__A7FAx"
      style={{
        paddingTop: "14rem",
        paddingBottom: "14rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: "1px solid rgba(242, 239, 233, 0.18)",
          paddingBottom: "2.4rem",
          marginBottom: "6.4rem",
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
          04 // Capabilities &amp; Consultancy Architecture
        </span>
        <span
          style={{
            fontFamily: "var(--font-herbik)",
            fontStyle: "italic",
            fontSize: "1.6rem",
            opacity: 0.75,
          }}
        >
          Saigon · Hong Kong · Tokyo · Paris
        </span>
      </div>

      {/* Asymmetric Split: Left Interactive Pillar Tabs, Right Detailed Spec & Matrix */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: "6.4rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Pillar Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
          {SERVICE_PILLARS.map((sec, idx) => {
            const isActive = activePillar === idx;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActivePillar(idx)}
                onMouseEnter={() => setActivePillar(idx)}
                style={{
                  textAlign: "left",
                  padding: "2.4rem 2.8rem",
                  borderRadius: "0.5rem",
                  border: "1px solid",
                  borderColor: isActive
                    ? "var(--brand-accent)"
                    : "rgba(242, 239, 233, 0.12)",
                  background: isActive
                    ? "rgba(212, 87, 42, 0.1)"
                    : "rgba(242, 239, 233, 0.02)",
                  transition: "all 0.35s ease",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "2rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: isActive ? "var(--brand-accent)" : "var(--text-secondary)",
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    Pillar // {sec.index}
                  </span>
                  <h3
                    style={{
                      fontSize: "clamp(2.2rem, 2.6vw, 3.6rem)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: isActive ? "var(--brand-yellow)" : "var(--text-secondary)",
                    }}
                  >
                    {sec.title}
                  </h3>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "2rem",
                    color: isActive ? "var(--brand-accent)" : "var(--text-disabled)",
                  }}
                >
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Pillar Deep Dive */}
        <div
          style={{
            padding: "4.8rem",
            borderRadius: "0.6rem",
            border: "1px solid rgba(242, 239, 233, 0.16)",
            background: "rgba(8, 9, 12, 0.55)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              fontSize: "1.2rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-accent)",
              marginBottom: "1.6rem",
            }}
          >
            Discipline Specification // {SERVICE_PILLARS[activePillar].index}
          </div>
          <h3
            style={{
              fontSize: "clamp(3.2rem, 4vw, 5.4rem)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              marginBottom: "2.4rem",
            }}
          >
            {SERVICE_PILLARS[activePillar].title}
          </h3>
          <p
            style={{
              fontSize: "1.8rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginBottom: "4rem",
            }}
          >
            {SERVICE_PILLARS[activePillar].body}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.6rem 3.2rem",
              borderTop: "1px solid rgba(242, 239, 233, 0.16)",
              paddingTop: "3.2rem",
            }}
          >
            {SERVICE_PILLARS[activePillar].capabilities.map((cap, i) => (
              <div
                key={cap}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  fontSize: "1.6rem",
                  paddingBottom: "1.2rem",
                  borderBottom: "1px solid rgba(242, 239, 233, 0.08)",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    color: "var(--brand-accent)",
                  }}
                >
                  0{i + 1}
                </span>
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. INTEGRATED LAB SECTION (WebGL Horizontal Infinite Carousel + Running GIF Engine)
// ============================================================================

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
  const videoUrl =
    item.data.use_video === true
      ? muxId
        ? `https://stream.mux.com/${muxId}.m3u8`
        : item.data.video_url?.trim() || null
      : null;
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
    float intensity = 0.125;
    float curvature = (sin(uv.y * M_PI) * uVelo) * intensity;
    pos.x = pos.x + (curvature / (max(uMeshSize.x, 1.0) * 0.001));

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
  uniform float uScale;
  uniform float uDistortionStrength;
  varying vec2 vUv;

  vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
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
    vec2 texCenter = vec2(0.5);
    vec2 texScale = (texUv - texCenter) * uScale + texCenter;
    vec4 texture = texture2D(uTexture, texScale + distortion);

    vec2 totalNormal = mouseNormalOffset;
    texture.rgb *= clamp(1.0 - length(totalNormal) * 0.6, 0.6, 1.0);

    gl_FragColor = texture;
  }
`;

const LabCarouselMesh = memo(function LabCarouselMesh({
  index,
  total,
  item,
  scrollRef,
  veloRef,
  onSelect,
}: {
  index: number;
  total: number;
  item: LabItem;
  scrollRef: React.RefObject<number>;
  veloRef: React.RefObject<number>;
  onSelect: (item: LabItem) => void;
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
      uBrushRadius: { value: 0.05 },
      uVelocity: { value: 0 },
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTexture: { value: fallbackTex },
      uDisplacementMap: { value: fboA.texture },
      uMeshSize: { value: new THREE.Vector2(380, 480) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uVelo: { value: 0 },
      uScale: { value: 1 },
      uDistortionStrength: { value: 0.2 },
      uVertexStrength: { value: 14 },
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
    const cardW = Math.min(400, w * 0.28);
    const cardH = cardW * 1.26;
    const gap = 24;
    const stride = cardW + gap;
    const totalW = stride * total;

    let x = (((index * stride - scrollRef.current) % totalW) + totalW) % totalW;
    if (x > totalW / 2) x -= totalW;

    meshRef.current.position.set(x, 0, 0);
    meshRef.current.scale.set(cardW, cardH, 1);

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
        onClick={() => onSelect(item)}
        onPointerMove={(e) => {
          if (!e.uv) return;
          const dx = e.uv.x - prevMouseUv.current.x;
          const dy = e.uv.y - prevMouseUv.current.y;
          simUniforms.uMouse.value.copy(e.uv);
          simUniforms.uVelocity.value = Math.min(Math.hypot(dx, dy) * 15, 1.5);
          prevMouseUv.current.copy(e.uv);
        }}
        onPointerLeave={() => {
          simUniforms.uVelocity.value = 0;
        }}
      >
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={LAB_VERT}
          fragmentShader={LAB_FRAG}
          uniforms={uniforms}
          transparent
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
});

export function IntegratedLabSection() {
  const rawLabs = (labData as { labs: LabItem[] }).labs;
  const labs = useMemo(() => rawLabs.slice(0, 12), [rawLabs]);
  const [selectedLab, setSelectedLab] = useState<LabItem | null>(null);

  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const veloRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      // Gentle auto-drift + user drag/scroll momentum
      targetScrollRef.current += 0.45;
      const diff = targetScrollRef.current - scrollRef.current;
      scrollRef.current += diff * 0.09;
      veloRef.current = Math.max(-2, Math.min(2, diff * 0.015));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const modalMedia = selectedLab ? getLabMedia(selectedLab) : null;
  const resolvedModalVideo =
    modalMedia?.videoUrl && modalMedia.videoUrl.includes(".mux.com")
      ? `/api/mux?url=${encodeURIComponent(modalMedia.videoUrl)}`
      : modalMedia?.videoUrl;

  return (
    <div
      id="section-lab"
      style={{
        paddingTop: "12rem",
        paddingBottom: "12rem",
        position: "relative",
        color: "var(--brand-dark-blue)",
      }}
    >
      <div className="Container_container__A7FAx">
        {/* Top Bar with Transferred Running Character Binary GIF Engine */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "3.2rem",
            borderBottom: "1px solid rgba(8, 9, 12, 0.16)",
            paddingBottom: "3.2rem",
            marginBottom: "4.8rem",
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
              07 // R&amp;D Visual Laboratory ({labs.length} Experiments)
            </span>
            <h2
              style={{
                fontSize: "clamp(3.6rem, 5.2vw, 7.6rem)",
                fontWeight: 600,
                lineHeight: 0.94,
                letterSpacing: "-0.035em",
                color: "var(--brand-dark-blue)",
              }}
            >
              Shaders, Motion &amp; Generative Studies
            </h2>
          </div>

          {/* Interactive Running Character Sprite Engine Widget (Moved from original loader) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              background: "rgba(8, 9, 12, 0.06)",
              backdropFilter: "blur(10px)",
              padding: "1.2rem 2.4rem 1.2rem 1.4rem",
              borderRadius: "999px",
              border: "1px solid rgba(8, 9, 12, 0.18)",
            }}
          >
            <div style={{ width: "5.6rem", height: "5.6rem", overflow: "hidden", flexShrink: 0 }}>
              <GifPlayer
                src="/images/loading.gif"
                interactiveMouse={true}
                speedMultiplier={1.2}
                className="PageLoader_pageLoader_gifImg__D7UIb"
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--brand-accent)",
                }}
              >
                EXP.00 — INTERACTIVE LZW SPRITE DECODER
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontFamily: "var(--font-herbik)",
                  fontStyle: "italic",
                  color: "var(--brand-dark-blue)",
                  opacity: 0.8,
                }}
              >
                Move cursor to modulate frame velocity &amp; direction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Drag & Momentum WebGL Infinite Strip */}
      <div
        style={{
          width: "100%",
          height: "56rem",
          position: "relative",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          isDraggingRef.current = true;
          dragStartXRef.current = e.clientX;
          dragStartScrollRef.current = targetScrollRef.current;
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return;
          const dx = dragStartXRef.current - e.clientX;
          targetScrollRef.current = dragStartScrollRef.current + dx * 1.6;
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
        }}
        onPointerLeave={() => {
          isDraggingRef.current = false;
        }}
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 100], zoom: 1, near: -1000, far: 1000 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={1} />
          {labs.map((item, idx) => (
            <LabCarouselMesh
              key={item.id}
              index={idx}
              total={labs.length}
              item={item}
              scrollRef={scrollRef}
              veloRef={veloRef}
              onSelect={(it) => setSelectedLab(it)}
            />
          ))}
        </Canvas>
      </div>

      <div
        className="Container_container__A7FAx"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2.4rem",
          fontSize: "1.4rem",
          fontFamily: "var(--font-herbik)",
          fontStyle: "italic",
          color: "var(--brand-dark-blue)",
          opacity: 0.75,
        }}
      >
        <span>← Drag horizontally or hover over WebGL planes to distort →</span>
        <span>Click any study to inspect full media</span>
      </div>

      {selectedLab && modalMedia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            backgroundColor: "rgba(8, 9, 12, 0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
          }}
          onClick={() => setSelectedLab(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedLab(null)}
            style={{
              position: "absolute",
              top: "3.2rem",
              right: "4.8rem",
              color: "var(--brand-yellow)",
              fontSize: "1.6rem",
              cursor: "pointer",
            }}
          >
            Close ×
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "75vw", maxHeight: "82vh" }}>
            {resolvedModalVideo ? (
              <video
                src={resolvedModalVideo}
                poster={modalMedia.posterUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={modalMedia.posterUrl}
                alt={selectedLab.data.title || ""}
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. INTEGRATED CAREERS / JOBS ACCORDION SECTION (Merged from /jobs)
// ============================================================================

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

const SENIOR_CD_FALLBACK: CareerItemData = {
  role: "Senior Creative Director",
  type: "Full-time / Leadership",
  location: "Asia / Asia hours (Saigon · Tokyo · HK)",
  poster: {
    dimensions: { width: 1122, height: 1402 },
    alt: "Hiring a Senior Creative Director",
    url: "/senior-creative-director-poster.png",
  },
  description: [
    {
      type: "paragraph",
      text: "We are looking for a Senior Creative Director to lead ambitious ideas from the first conversation through to final delivered work across brand direction, digital products, and spatial experiences.",
      spans: [],
    },
  ] as unknown as RichTextField,
};

export function IntegratedJobsSection() {
  const data = jobsData as unknown as {
    slices?: Array<{
      slice_type: string;
      primary?: { list?: Array<{ item: { uid?: string; data?: CareerItemData } }> };
    }>;
  };

  const careerSlice = data.slices?.find((s) => s.slice_type === "career_list");
  const rawList = careerSlice?.primary?.list ?? [];
  const roles: CareerItemData[] = useMemo(() => {
    const mapped = rawList.map((r) => r.item?.data).filter(Boolean) as CareerItemData[];
    const hasSenior = mapped.some(
      (m) => m.role?.toLowerCase().trim() === "senior creative director"
    );
    return hasSenior ? mapped : [...mapped, SENIOR_CD_FALLBACK];
  }, [rawList]);

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div
      id="section-jobs"
      className="Container_container__A7FAx"
      style={{
        paddingTop: "14rem",
        paddingBottom: "14rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "3.2rem",
          borderBottom: "1px solid rgba(242, 239, 233, 0.2)",
          paddingBottom: "3.2rem",
          marginBottom: "4.8rem",
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
            09 // Open Positions ({roles.length} Roles)
          </span>
          <h2
            style={{
              fontSize: "clamp(3.6rem, 5.2vw, 7.6rem)",
              fontWeight: 600,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
            }}
          >
            Join the Collective
          </h2>
        </div>

        <p
          style={{
            fontSize: "1.6rem",
            fontFamily: "var(--font-herbik)",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            maxWidth: "42rem",
          }}
        >
          Seeking directors, real-time shader artists, and producers across Saigon, Hong Kong, Tokyo, and Paris.
        </p>
      </div>

      <ul style={{ display: "flex", flexDirection: "column" }}>
        {roles.map((roleData, idx) => {
          const isOpen = expandedIdx === idx;
          return (
            <li
              key={idx}
              style={{
                borderBottom: "1px solid rgba(242, 239, 233, 0.16)",
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  padding: "3.2rem 0",
                  display: "grid",
                  gridTemplateColumns: "4rem 2fr 1fr 1fr auto",
                  gap: "2.4rem",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    fontSize: "1.6rem",
                    color: "var(--brand-accent)",
                  }}
                >
                  0{idx + 1}
                </span>
                <span
                  style={{
                    fontSize: "clamp(2.2rem, 3.2vw, 4.4rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {roleData.role}
                </span>
                <span style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>
                  {roleData.type || "Full-time | Freelance"}
                </span>
                <span style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>
                  {roleData.location}
                </span>
                <span
                  style={{
                    fontSize: "2.4rem",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.35s ease",
                    color: "var(--brand-accent)",
                  }}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    paddingBottom: "4.8rem",
                    display: "grid",
                    gridTemplateColumns: roleData.poster?.url ? "32rem 1fr" : "1fr",
                    gap: "4.8rem",
                    alignItems: "start",
                  }}
                >
                  {roleData.poster?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={roleData.poster.url}
                      alt={roleData.poster.alt || roleData.role || ""}
                      style={{
                        width: "100%",
                        borderRadius: "0.4rem",
                        border: "1px solid rgba(242, 239, 233, 0.15)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "1.6rem",
                      lineHeight: 1.65,
                      color: "var(--text-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.6rem",
                      maxWidth: "76rem",
                    }}
                  >
                    {roleData.description && (
                      <PrismicRichText field={roleData.description} />
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
