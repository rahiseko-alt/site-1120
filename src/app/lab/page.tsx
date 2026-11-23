"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Hls from "hls.js";
import { useViewport } from "@/hooks/usePageLifecycle";
import { useLabModalStore } from "@/stores/appStore";
import { GifPlayer } from "@/components/common/GifPlayer";
import labData from "@/data/lab.json";

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
  uniform vec2 uResolution;
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

function LabCardMesh({
  index,
  total,
  item,
  videoEl,
  scrollRef,
  veloRef,
  mouseRef,
  dragDistRef,
  onOpenModal,
}: {
  index: number;
  total: number;
  item: LabItem;
  videoEl: HTMLVideoElement | null;
  scrollRef: React.RefObject<number>;
  veloRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  dragDistRef: React.RefObject<number>;
  onOpenModal: (index: number) => void;
}) {
  const { posterUrl } = useMemo(() => getLabMedia(item), [item]);
  const fallbackTex = useTexture(posterUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const videoTexRef = useRef<THREE.VideoTexture | null>(null);
  const videoReadyRef = useRef(false);
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
      uBrushRadius: { value: 0.04 },
      uVelocity: { value: 0 },
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTexture: { value: fallbackTex },
      uDisplacementMap: { value: fboA.texture },
      uMeshSize: { value: new THREE.Vector2(440, 560) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uVelo: { value: 0 },
      uScale: { value: 1 },
      uDistortionStrength: { value: 0.2 },
      uVertexStrength: { value: 14 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
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

  useEffect(() => {
    if (!videoEl) return;
    const vt = new THREE.VideoTexture(videoEl);
    vt.minFilter = THREE.LinearFilter;
    vt.magFilter = THREE.LinearFilter;
    vt.colorSpace = THREE.SRGBColorSpace;
    vt.generateMipmaps = false;
    videoTexRef.current = vt;
    const onMeta = () => {
      if (videoEl.videoWidth && videoEl.videoHeight) {
        uniforms.uImageSize.value.set(videoEl.videoWidth, videoEl.videoHeight);
      }
    };
    videoEl.addEventListener("loadedmetadata", onMeta);
    return () => {
      videoEl.removeEventListener("loadedmetadata", onMeta);
      vt.dispose();
      videoTexRef.current = null;
      videoReadyRef.current = false;
    };
  }, [videoEl, uniforms]);

  useFrame(({ gl }) => {
    if (!meshRef.current || !matRef.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cardW = (w / 1440) * 440;
    const cardH = (w / 1440) * 560;
    const gap = (w / 1440) * 24;
    const stride = cardW + gap;
    const totalW = stride * total;

    // Infinite wrap around horizontal scroll
    let x = ((index * stride - scrollRef.current) % totalW + totalW) % totalW;
    if (x > totalW / 2) x -= totalW;

    meshRef.current.position.set(x, 0, 0);
    meshRef.current.scale.set(cardW, cardH, 1);

    const visible = Math.abs(x) < w * 0.85;
    if (videoEl && videoTexRef.current) {
      if (visible) {
        if (videoEl.paused) videoEl.play().catch(() => {});
        if (videoEl.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          if (!videoReadyRef.current) {
            videoReadyRef.current = true;
            matRef.current.uniforms.uTexture.value = videoTexRef.current;
          }
          videoTexRef.current.needsUpdate = true;
        }
      } else if (!videoEl.paused) {
        videoEl.pause();
      }
    }

    const mx = mouseRef.current.x - w / 2;
    const my = -(mouseRef.current.y - h / 2);
    const u = (mx - (x - cardW / 2)) / cardW;
    const v = (my - -cardH / 2) / cardH;
    const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;

    if (inside) {
      const dx = u - prevMouseUv.current.x;
      const dy = v - prevMouseUv.current.y;
      simUniforms.uMouse.value.set(u, v);
      simUniforms.uVelocity.value = Math.min(Math.hypot(dx, dy) * 15, 1.5);
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
    matRef.current.uniforms.uMeshSize.value.set(cardW, cardH);
    matRef.current.uniforms.uVelo.value = veloRef.current;
    matRef.current.uniforms.uResolution.value.set(w, h);
  });

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={() => {
          if (dragDistRef.current <= 5) onOpenModal(index);
        }}
      >
        <planeGeometry args={[1, 1, 32, 32]} />
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

function HiddenLabVideo({
  labId,
  videoUrl,
  posterUrl,
  onRegister,
}: {
  labId: string;
  videoUrl: string;
  posterUrl: string;
  onRegister: (id: string, el: HTMLVideoElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onRegister(labId, el);
    const resolvedUrl = videoUrl.includes(".mux.com")
      ? `/api/mux?url=${encodeURIComponent(videoUrl)}`
      : videoUrl;
    let hls: Hls | null = null;
    if (videoUrl.includes(".m3u8")) {
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
    return () => {
      hls?.destroy();
      onRegister(labId, null);
    };
  }, [labId, videoUrl, onRegister]);

  return (
    <video
      ref={ref}
      playsInline
      muted
      loop
      crossOrigin="anonymous"
      poster={posterUrl}
      preload="metadata"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
}

function MobileLabCard({
  item,
  onSelect,
}: {
  item: LabItem;
  onSelect: (el: HTMLVideoElement | null) => void;
}) {
  const { videoUrl, posterUrl } = getLabMedia(item);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    const resolvedUrl = videoUrl.includes(".mux.com")
      ? `/api/mux?url=${encodeURIComponent(videoUrl)}`
      : videoUrl;
    let hls: Hls | null = null;
    if (videoUrl.includes(".m3u8")) {
      if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = resolvedUrl;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.attachMedia(el);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls?.loadSource(resolvedUrl));
      }
    } else {
      el.src = resolvedUrl;
    }
    return () => hls?.destroy();
  }, [videoUrl]);

  return (
    <div
      className="MobileLabList_lab__wt5rn"
      onClick={() => onSelect(videoRef.current)}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          className="MobileLabList_lab_video__D0WJ6"
          playsInline
          muted
          loop
          autoPlay
          poster={posterUrl}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt={item.data.title || ""}
          className="MobileLabList_lab_image__Fb91n"
        />
      )}
    </div>
  );
}

export default function LabPage() {
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
  const [videoEls, setVideoEls] = useState<Record<string, HTMLVideoElement>>({});
  const activeModalIdx = useLabModalStore((s) => s.activeLabIndex);
  const setActiveLabIndex = useLabModalStore((s) => s.actions.setActiveLabIndex);

  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const veloRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const registerVideo = useCallback((id: string, el: HTMLVideoElement | null) => {
    setVideoEls((prev) => {
      if (!el) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: el };
    });
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    let rafId = 0;
    const tick = () => {
      const diff = targetScrollRef.current - scrollRef.current;
      scrollRef.current += diff * 0.1;
      veloRef.current = Math.max(-2, Math.min(2, diff * 0.015));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      targetScrollRef.current += (e.deltaY + e.deltaX) * 0.8;
    };
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartScrollRef.current = targetScrollRef.current;
      dragDistRef.current = 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isDraggingRef.current) return;
      const dx = dragStartXRef.current - e.clientX;
      dragDistRef.current = Math.abs(dx);
      targetScrollRef.current = dragStartScrollRef.current + dx * 1.4;
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDesktop]);

  const modalItem = activeModalIdx !== null ? labs[activeModalIdx] : null;
  const modalMedia = modalItem ? getLabMedia(modalItem) : null;

  return (
    <>
      {isDesktop &&
        labs.map((l) => {
          const { videoUrl, posterUrl } = getLabMedia(l);
          if (!videoUrl) return null;
          return (
            <HiddenLabVideo
              key={l.id}
              labId={l.id}
              videoUrl={videoUrl}
              posterUrl={posterUrl}
              onRegister={registerVideo}
            />
          );
        })}

      <div className="LabPage_labPage__F6_X_" style={{ backgroundColor: "var(--brand-yellow)", minHeight: "100svh" }}>
        <div className="LabList_container__placeholder">
          {isDesktop ? (
            <div className="LabList_list_canvasPlaceholder__placeholder" style={{ height: "100svh" }}>
              <Canvas
                orthographic
                camera={{ position: [0, 0, 100], zoom: 1, near: -1000, far: 1000 }}
                style={{ position: "fixed", inset: 0, zIndex: 30 }}
                gl={{ alpha: true, antialias: true }}
              >
                <ambientLight intensity={1} />
                {labs.map((item, idx) => (
                  <LabCardMesh
                    key={item.id}
                    index={idx}
                    total={labs.length}
                    item={item}
                    videoEl={videoEls[item.id] ?? null}
                    scrollRef={scrollRef}
                    veloRef={veloRef}
                    mouseRef={mouseRef}
                    dragDistRef={dragDistRef}
                    onOpenModal={(i) => setActiveLabIndex(i)}
                  />
                ))}
              </Canvas>
            </div>
          ) : (
            <div className="MobileLabList_list__dZgcl">
              {labs.map((item) => (
                <MobileLabCard
                  key={item.id}
                  item={item}
                  onSelect={(el) => {
                    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isDesktop && (
        <div
          className="LabPage_note__wrapper"
          style={{
            position: "fixed",
            bottom: "2.8rem",
            left: "var(--padding-x)",
            right: "var(--padding-x)",
            zIndex: 40,
            color: "var(--brand-dark-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          {/* Interactive Binary GIF Frame Decoder Widget transferred from original loader */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.6rem",
              background: "rgba(8, 9, 12, 0.06)",
              backdropFilter: "blur(8px)",
              padding: "0.8rem 1.8rem 0.8rem 1rem",
              borderRadius: "999px",
              border: "1px solid rgba(8, 9, 12, 0.14)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ width: "4.4rem", height: "4.4rem", overflow: "hidden", flexShrink: 0 }}>
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
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                EXP.00 — BINARY GIF FRAME ENGINE
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontFamily: "var(--font-herbik)",
                  fontStyle: "italic",
                  opacity: 0.75,
                }}
              >
                Real-time LZW patch decompression reacting to cursor velocity
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "1.3rem",
              fontFamily: "var(--font-herbik)",
              fontStyle: "italic",
              letterSpacing: "0.02em",
            }}
          >
            <span>Scroll or drag horizontally to inspect WebGL studies →</span>
          </div>
        </div>
      )}

      {modalItem && modalMedia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            backgroundColor: "rgba(5, 18, 54, 0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
          }}
          onClick={() => setActiveLabIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveLabIndex(null)}
            style={{
              position: "absolute",
              top: "3.2rem",
              right: "4.8rem",
              color: "#fffde2",
              fontSize: "1.6rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "70vw", maxHeight: "80vh" }}>
            {modalMedia.videoUrl ? (
              <video
                src={
                  modalMedia.videoUrl.includes(".mux.com")
                    ? `/api/mux?url=${encodeURIComponent(modalMedia.videoUrl)}`
                    : modalMedia.videoUrl
                }
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
                alt={modalItem.data.title || ""}
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
