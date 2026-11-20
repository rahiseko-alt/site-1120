"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { create } from "zustand";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { useLenis } from "@/components/layout/LenisProvider";
import { useRouterTransition, useViewport } from "@/hooks/usePageLifecycle";
import { TransitionLink } from "@/components/common/TransitionLink";
import { ROUTES } from "@/lib/constants";
import workData from "@/data/work.json";

interface ProjectItem {
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

const useWorkHoverStore = create<{
  hoveredProject: string | null;
  setHoveredProject: (uid: string | null) => void;
}>((set, get) => ({
  hoveredProject: null,
  setHoveredProject: (uid) => {
    if (get().hoveredProject !== uid) set({ hoveredProject: uid });
  },
}));

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

const CARD_VERT = `
  precision mediump float;

  uniform float uVelo;
  uniform sampler2D uDisplacementMap;
  uniform float uVertexStrength;
  uniform vec2 uResolution;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uStickOffset;
  varying vec2 vUv;

  #define M_PI 3.1415926535897932384626433832795

  void main() {
    vec3 pos = position;

    // 1. Scroll-based displacement
    pos.y = pos.y + ((sin(uv.x * M_PI) * uVelo) * 0.125);

    // 2. Mouse trailing displacement
    float mouseDisp = texture2D(uDisplacementMap, uv).r;
    pos.z += mouseDisp * uVertexStrength;

    // 3. Stick effect
    vec2 center = vec2(0.5, 0.5);
    float dist = length(uv.xy - center);
    float maxDist = length(vec2(0.5, 0.5));
    float normalizedDist = dist / maxDist;
    float stickEffect = normalizedDist * uDirection;
    float offset = uStickOffset > 0.0 ? uStickOffset : uVertexStrength;
    pos.z += stickEffect * offset * uProgress;

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const CARD_FRAG = `
  precision mediump float;

  uniform sampler2D uTexture;
  uniform sampler2D uDisplacementMap;
  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;
  uniform float uVelo;
  uniform float uScale;
  uniform float uDistortionStrength;
  uniform float uOpacity;
  uniform float uGrayscale;
  uniform float uDimmedOpacity;
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

    if (uGrayscale > 0.5) {
      float luminance = dot(texture.rgb, vec3(0.299, 0.587, 0.114));
      texture.rgb = vec3(luminance);
    }
    texture.a *= uOpacity * uDimmedOpacity;

    gl_FragColor = texture;
  }
`;

const WorkCardMesh = memo(function WorkCardMesh({
  index,
  project,
  totalCount,
  mouseRef,
  onSelectProject,
}: {
  index: number;
  project: ProjectItem;
  totalCount: number;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  onSelectProject: (uid: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const simMatRef = useRef<THREE.ShaderMaterial>(null);
  const scrollYRef = useRef(0);
  const baseYRef = useRef(0);
  const prevScrollRef = useRef(0);
  const targetVeloRef = useRef(0);
  const currentVeloRef = useRef(0);
  const hasScrollInit = useRef(false);
  const grayRef = useRef({ value: 0 });
  const dimRef = useRef({ value: 1 });
  const scaleRef = useRef({ value: 1 });
  const prevMouseUv = useRef(new THREE.Vector2(0.5, 0.5));
  const { onScroll } = useLenis();

  const imgUrl = project.data.card_thumbnail?.url || "/images/test.jpg";
  const texture = useTexture(imgUrl);

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
      uBrushRadius: { value: 0.08 },
      uVelocity: { value: 0 },
    }),
    []
  );

  const cardUniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDisplacementMap: { value: fboA.texture },
      uMeshSize: { value: new THREE.Vector2(504, 550) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uVelo: { value: 0 },
      uScale: { value: 1 },
      uDistortionStrength: { value: 0.15 },
      uOpacity: { value: 1 },
      uGrayscale: { value: 0 },
      uDimmedOpacity: { value: 1 },
      uVertexStrength: { value: 12 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
      uProgress: { value: 0 },
      uDirection: { value: -1 },
      uStickOffset: { value: 0 },
    }),
    [texture, fboA]
  );

  useEffect(() => {
    if (texture?.image) {
      const img = texture.image as HTMLImageElement;
      if (img.naturalWidth && img.naturalHeight) {
        cardUniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
      }
    }
  }, [texture, cardUniforms]);

  const computeLayout = useCallback(() => {
    if (totalCount === 0 || !meshRef.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const half = Math.ceil(totalCount / 2);
    const isLeft = index < half;
    const colIdx = isLeft ? index : index - half;
    const cardW = (w / 1920) * 504;
    const cardH = cardW / (504 / 550);
    const leftX = isLeft ? 0.23125 * w : 0.50625 * w;
    const topY = (isLeft ? 0.1390625 * w : 0.2015625 * w) + 0.2989583333333333 * w * colIdx;
    const x = leftX + (-w / 2 + cardW / 2);
    const y = h / 2 - cardH / 2 - topY;
    baseYRef.current = y;
    meshRef.current.scale.set(cardW, cardH, 1);
    meshRef.current.position.set(x, y - scrollYRef.current, 0);
  }, [index, totalCount]);

  useLayoutEffect(() => {
    computeLayout();
    window.addEventListener("resize", computeLayout);
    return () => window.removeEventListener("resize", computeLayout);
  }, [computeLayout]);

  useEffect(() => {
    return onScroll((e) => {
      const s = e.scroll;
      scrollYRef.current = -s;
      if (meshRef.current) {
        meshRef.current.position.y = baseYRef.current - scrollYRef.current;
      }
      if (hasScrollInit.current) {
        const delta = s - prevScrollRef.current;
        prevScrollRef.current = s;
        targetVeloRef.current = Math.max(-1.25, Math.min(1.25, 0.03 * delta));
      } else {
        hasScrollInit.current = true;
        prevScrollRef.current = s;
      }
    });
  }, [onScroll]);

  useEffect(() => {
    let prev: string | null = null;
    return useWorkHoverStore.subscribe((s) => {
      if (s.hoveredProject === prev) return;
      prev = s.hoveredProject;
      const dimmed = s.hoveredProject !== null && s.hoveredProject !== project.uid;
      const isMe = s.hoveredProject === project.uid;
      gsap.to(grayRef.current, {
        value: dimmed ? 1 : 0,
        duration: 1.2,
        ease: "power3.out",
      });
      gsap.to(dimRef.current, {
        value: dimmed ? 0.3 : 1,
        duration: 1.2,
        ease: "power3.out",
      });
      gsap.to(scaleRef.current, {
        value: isMe ? 0.96 : 1,
        duration: 0.8,
        ease: "power3.out",
      });
    });
  }, [project.uid]);

  useFrame(({ gl }) => {
    if (!meshRef.current || !matRef.current || !simMatRef.current) return;

    currentVeloRef.current += (targetVeloRef.current - currentVeloRef.current) * 0.12;
    if (Math.abs(currentVeloRef.current) < 5e-4 && Math.abs(targetVeloRef.current) < 5e-4) {
      currentVeloRef.current = 0;
      targetVeloRef.current = 0;
    }

    // Check if mouse is over this mesh
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mx = mouseRef.current.x - w / 2;
    const my = -(mouseRef.current.y - h / 2);
    const px = meshRef.current.position.x;
    const py = meshRef.current.position.y;
    const sx = meshRef.current.scale.x;
    const sy = meshRef.current.scale.y;

    const u = (mx - (px - sx / 2)) / sx;
    const v = (my - (py - sy / 2)) / sy;
    const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;

    if (inside) {
      const dx = u - prevMouseUv.current.x;
      const dy = v - prevMouseUv.current.y;
      const spd = Math.min(Math.hypot(dx, dy) * 15, 1.5);
      simUniforms.uMouse.value.set(u, v);
      simUniforms.uVelocity.value = spd;
      prevMouseUv.current.set(u, v);
    } else {
      simUniforms.uVelocity.value = 0;
    }

    const readFbo = currentFbo.current;
    const writeFbo = readFbo === fboA ? fboB : fboA;
    simUniforms.uTexture.value = readFbo.texture;
    gl.setRenderTarget(writeFbo);
    gl.render(simScene, simCam);
    gl.setRenderTarget(null);
    currentFbo.current = writeFbo;

    matRef.current.uniforms.uDisplacementMap.value = writeFbo.texture;
    matRef.current.uniforms.uMeshSize.value.set(sx, sy);
    matRef.current.uniforms.uVelo.value = currentVeloRef.current;
    matRef.current.uniforms.uGrayscale.value = grayRef.current.value;
    matRef.current.uniforms.uDimmedOpacity.value = dimRef.current.value;
    matRef.current.uniforms.uScale.value = scaleRef.current.value;
    matRef.current.uniforms.uResolution.value.set(w, h);
  });

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={() => onSelectProject(project.uid)}
      >
        <planeGeometry args={[1, 1, 64, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={CARD_VERT}
          fragmentShader={CARD_FRAG}
          uniforms={cardUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={simMatRef}
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

export default function WorkPage() {
  const categories = workData.categories as unknown as CategoryItem[];
  const allProjects = workData.projects as unknown as ProjectItem[];
  const counts = workData.counts as number[];

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const hoveredUid = useWorkHoverStore((s) => s.hoveredProject);
  const setHoveredProject = useWorkHoverStore((s) => s.setHoveredProject);
  const { isDesktop } = useViewport();
  const { __lenis } = useLenis();
  const { routerPrefetch } = useRouterTransition();
  const pageRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const filteredProjects = useMemo(() => {
    if (!selectedCat) return allProjects;
    return allProjects.filter((p) =>
      p.data.categories?.some((c) => c.category?.uid === selectedCat)
    );
  }, [allProjects, selectedCat]);

  const half = Math.ceil(filteredProjects.length / 2);
  const leftCol = filteredProjects.slice(0, half);
  const rightCol = filteredProjects.slice(half);
  const activeCatIndex = categories.findIndex((c) => c.uid === selectedCat);

  const handleCategoryClick = (uid: string | null) => {
    setSelectedCat(uid);
    __lenis?.scrollTo(0, { immediate: false, duration: 1.2 });
  };

  const handleSelectProject = useCallback(
    (uid: string) => {
      routerPrefetch({ pathName: `${ROUTES.WORK}/${uid}`, pageName: "WorkDetail" });
    },
    [routerPrefetch]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="WorkPage_page__T7eIJ" ref={pageRef}>
      <div className="WorkPage_page_content__CbHOJ">
        <div
          className="CategoryList_list__aEOZp"
          style={{ "--current": activeCatIndex } as React.CSSProperties}
        >
          <div className="CategoryList_list_content__mMxHI">
            <ul className="CategoryList_list_content_names__FJi1V">
              <li
                className={`CategoryList_list_content_names_name__6hdDS ${
                  !selectedCat ? "CategoryList_list_content_names_name__active__qT_t7" : ""
                }`}
                style={{ "--index": 0 } as React.CSSProperties}
              >
                <div className="CategoryList_list_content_clip__pYp0_">
                  <button
                    type="button"
                    className="CategoryList_animated__IDOq5"
                    onClick={() => handleCategoryClick(null)}
                  >
                    All projects
                  </button>
                </div>
              </li>
              {categories.map((cat, idx) => (
                <li
                  key={cat.uid}
                  className={`CategoryList_list_content_names_name__6hdDS ${
                    selectedCat === cat.uid
                      ? "CategoryList_list_content_names_name__active__qT_t7"
                      : ""
                  }`}
                  style={{ "--index": idx + 1 } as React.CSSProperties}
                >
                  <div className="CategoryList_list_content_clip__pYp0_">
                    <button
                      type="button"
                      className="CategoryList_animated__IDOq5"
                      onClick={() => handleCategoryClick(cat.uid)}
                    >
                      {cat.data.name}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <ul className="CategoryList_list_content_counts__Efhfl">
              <li
                className={`CategoryList_list_content_counts_count___QY42 ${
                  !selectedCat ? "CategoryList_list_content_counts_count__active__2B6E_" : ""
                }`}
                style={{ "--index": 0 } as React.CSSProperties}
              >
                <div className="CategoryList_list_content_clip__pYp0_">
                  <button
                    type="button"
                    className="CategoryList_animated__IDOq5"
                    onClick={() => handleCategoryClick(null)}
                  >
                    {counts[0] ?? allProjects.length}
                  </button>
                </div>
              </li>
              {categories.map((cat, idx) => (
                <li
                  key={cat.uid}
                  className={`CategoryList_list_content_counts_count___QY42 ${
                    selectedCat === cat.uid
                      ? "CategoryList_list_content_counts_count__active__2B6E_"
                      : ""
                  }`}
                  style={{ "--index": idx + 1 } as React.CSSProperties}
                >
                  <div className="CategoryList_list_content_clip__pYp0_">
                    <button
                      type="button"
                      className="CategoryList_animated__IDOq5"
                      onClick={() => handleCategoryClick(cat.uid)}
                    >
                      {counts[idx + 1] ?? 0}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="CategoryList_list_content_line__8Z6b4" />
          </div>
        </div>

        <div className="WorkPage_page_content_info__fhRtC">
          <div className="WorkPage_page_content_info_descriptions__yOCdA">
            {filteredProjects.map((proj) => {
              const isActive = hoveredUid === proj.uid;
              return (
                <div
                  key={proj.uid}
                  className="WorkPage_page_content_info_descriptions_item__omPtl"
                  style={{
                    opacity: isActive ? 1 : 0,
                    visibility: isActive ? "visible" : "hidden",
                    transition: "opacity 0.4s ease",
                  }}
                >
                  {proj.data.description && (
                    <PrismicRichText field={proj.data.description} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`WorkPage_page_content_visual__wfm_m ${
            filteredProjects.length === 0 ? "WorkPage_page_content_visual__empty__xd2wR" : ""
          }`}
        >
          <div className="ProjectList_container__KBet0">
            <div className="ProjectList_list__lPCRq">
              <div className="ProjectList_list_content_col__52ody ProjectList_list_content_col__left__TC8AC">
                {leftCol.map((proj, idx) => (
                  <TransitionLink
                    key={proj.uid}
                    href={`${ROUTES.WORK}/${proj.uid}`}
                    className="ProjectList_card__PiGCk"
                    onMouseEnter={() => setHoveredProject(proj.uid)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div
                      className="ProjectList_card_image__pXbyO"
                      style={{ opacity: isDesktop ? 0 : 1 }}
                    >
                      {proj.data.card_thumbnail?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proj.data.card_thumbnail.url}
                          alt={proj.data.name || ""}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    {!isDesktop && (
                      <p className="ProjectList_card_name__7QIS5">{proj.data.name}</p>
                    )}
                    <span className="sr-only">{idx}</span>
                  </TransitionLink>
                ))}
              </div>
              <div className="ProjectList_list_content_col__52ody ProjectList_list_content_col__right__RnExJ">
                {rightCol.map((proj, idx) => (
                  <TransitionLink
                    key={proj.uid}
                    href={`${ROUTES.WORK}/${proj.uid}`}
                    className="ProjectList_card__PiGCk"
                    onMouseEnter={() => setHoveredProject(proj.uid)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div
                      className="ProjectList_card_image__pXbyO"
                      style={{ opacity: isDesktop ? 0 : 1 }}
                    >
                      {proj.data.card_thumbnail?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proj.data.card_thumbnail.url}
                          alt={proj.data.name || ""}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    {!isDesktop && (
                      <p className="ProjectList_card_name__7QIS5">{proj.data.name}</p>
                    )}
                    <span className="sr-only">{idx}</span>
                  </TransitionLink>
                ))}
              </div>
            </div>
          </div>

          <div className="WorkPage_page_content_info__fhRtC" data-blend>
            <div className="WorkPage_page_content_info_names__XtE_Y">
              {filteredProjects.map((proj) => {
                const isActive = hoveredUid === proj.uid;
                return (
                  <div
                    key={proj.uid}
                    className="WorkPage_page_content_info_names_item__y4d6l"
                    style={{
                      opacity: isActive ? 1 : 0,
                      filter: isActive ? "blur(0px)" : "blur(10px)",
                      visibility: isActive ? "visible" : "hidden",
                      transition: "opacity 0.5s ease, filter 0.5s ease",
                    }}
                  >
                    <h2>{proj.data.name}</h2>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isDesktop && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 100], zoom: 1, near: -1000, far: 1000 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            pointerEvents: "none",
          }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={1} />
          {filteredProjects.map((proj, idx) => (
            <WorkCardMesh
              key={`${selectedCat || "all"}-${proj.uid}`}
              index={idx}
              project={proj}
              totalCount={filteredProjects.length}
              mouseRef={mouseRef}
              onSelectProject={handleSelectProject}
            />
          ))}
        </Canvas>
      )}
    </div>
  );
}
