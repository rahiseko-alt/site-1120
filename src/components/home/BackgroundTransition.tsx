"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useSectionStore } from "@/stores/appStore";
import { useLenis } from "@/components/layout/LenisProvider";
import { HlsVideo } from "@/components/common/HlsVideo";

interface MediaPair {
  videoUrl?: string;
  posterUrl?: string;
}

const BLOB_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BLOB_FRAG = `
  precision highp float;

  uniform float uTime;
  uniform float uScrollVelo;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uBaseBg;
  uniform float uMorph;
  uniform float uLightMode;
  varying vec2 vUv;

  // 3D Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.28;
    float velo = clamp(abs(uScrollVelo) * 0.6, 0.0, 1.6);

    // Domain warping for organic liquid tendrils ("ウネウネ")
    float n1 = snoise(vec3(p * (1.35 + uMorph * 0.25), t));
    float n2 = snoise(vec3(p * 2.1 + vec2(n1 * 0.65), t * 1.25 + 4.2));
    vec2 warpedP = p + vec2(n1, n2) * (0.28 + velo * 0.14);

    // Three orbiting organic metaball cores with distinct trajectories
    vec2 c1 = vec2(sin(t * 0.9 + uMorph) * 0.38, cos(t * 0.7) * 0.24);
    vec2 c2 = vec2(cos(t * 0.65 - uMorph * 0.8) * -0.35, sin(t * 1.1) * 0.28);
    vec2 c3 = mix(vec2(sin(t * 1.2) * 0.2, cos(t * 0.85) * -0.25), m, 0.55);

    float d1 = length(warpedP - c1);
    float d2 = length(warpedP - c2);
    float d3 = length(warpedP - c3);

    // Smooth metaball field potential
    float field = 0.22 / (d1 * d1 + 0.09)
                + 0.19 / (d2 * d2 + 0.08)
                + 0.17 / (d3 * d3 + 0.07);

    // Inner core & outer rim undulations
    float blobMask = smoothstep(1.35, 2.65, field);
    float rimMask = smoothstep(1.1, 1.85, field) - smoothstep(1.85, 3.1, field);
    float tendrilNoise = snoise(vec3(warpedP * 3.2, t * 1.6)) * 0.5 + 0.5;

    vec3 col = uBaseBg;
    vec3 fluidColor = mix(uColorA, uColorB, smoothstep(-0.6, 0.6, n1));
    fluidColor = mix(fluidColor, uColorC, rimMask * 0.85 + tendrilNoise * 0.25);

    // Add luminous caustics along the undulating ridges
    float caustic = pow(max(0.0, sin(field * 2.4 - t * 3.0 + n2 * 2.5)), 3.0);
    fluidColor += uColorC * caustic * 0.35;

    col = mix(col, fluidColor, blobMask * (1.0 - uLightMode * 0.82));

    // Subtle vignette for depth
    float vig = smoothstep(1.35, 0.25, length(p * 0.85));
    col *= mix(0.75, 1.05, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Palette per section index (Unified Main Page):
// 0: Hero (Emerald Teal & Deep Obsidian & Amber)
// 1: Featured Work / Showcase (Warm Platinum light mode)
// 2: Complete Works Matrix (Deep Obsidian & Emerald Cyan)
// 3: Philosophy / About (Violet Indigo & Crimson Amber)
// 4: Capabilities & Services Matrix (Deep Teal & Cyber Emerald)
// 5: Collaborations / Arc (Obsidian & Copper Vermilion)
// 6: Collective / Team (Midnight Slate & Electric Violet)
// 7: R&D Lab + Interactive GIF Sprite Engine (Warm Platinum light mode)
// 8: Recognition / Awards (Alabaster light mode)
// 9: Open Positions / Jobs + Press (Deep Forest Slate #101615)
// 10+: Footer (Deep Obsidian & Warm Gold)
const SECTION_PALETTES: Array<{
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  bg: [number, number, number];
  morph: number;
  light: number;
}> = [
  { a: [0.05, 0.43, 0.37], b: [0.16, 0.11, 0.36], c: [0.83, 0.34, 0.16], bg: [0.031, 0.035, 0.047], morph: 0.0, light: 0.0 },
  { a: [0.88, 0.84, 0.78], b: [0.83, 0.34, 0.16], c: [0.05, 0.43, 0.37], bg: [0.949, 0.937, 0.914], morph: 1.2, light: 1.0 },
  { a: [0.04, 0.32, 0.38], b: [0.12, 0.16, 0.32], c: [0.83, 0.34, 0.16], bg: [0.031, 0.035, 0.047], morph: 2.0, light: 0.0 },
  { a: [0.23, 0.11, 0.43], b: [0.55, 0.16, 0.24], c: [0.88, 0.46, 0.22], bg: [0.031, 0.035, 0.047], morph: 2.8, light: 0.0 },
  { a: [0.04, 0.38, 0.34], b: [0.08, 0.24, 0.38], c: [0.22, 0.75, 0.62], bg: [0.031, 0.035, 0.047], morph: 3.6, light: 0.0 },
  { a: [0.48, 0.19, 0.12], b: [0.18, 0.12, 0.32], c: [0.88, 0.42, 0.18], bg: [0.031, 0.035, 0.047], morph: 4.8, light: 0.0 },
  { a: [0.14, 0.18, 0.34], b: [0.05, 0.38, 0.34], c: [0.76, 0.32, 0.22], bg: [0.031, 0.035, 0.047], morph: 6.0, light: 0.0 },
  { a: [0.88, 0.85, 0.79], b: [0.83, 0.34, 0.16], c: [0.05, 0.43, 0.37], bg: [0.949, 0.937, 0.914], morph: 6.8, light: 1.0 },
  { a: [0.85, 0.82, 0.76], b: [0.05, 0.43, 0.37], c: [0.83, 0.34, 0.16], bg: [0.949, 0.937, 0.914], morph: 7.5, light: 1.0 },
  { a: [0.06, 0.28, 0.22], b: [0.12, 0.20, 0.18], c: [0.83, 0.34, 0.16], bg: [0.063, 0.086, 0.082], morph: 8.2, light: 0.0 },
  { a: [0.05, 0.35, 0.30], b: [0.35, 0.15, 0.12], c: [0.83, 0.34, 0.16], bg: [0.02, 0.022, 0.03], morph: 9.0, light: 0.0 },
];

function OrganicBlobPlane({ sectionIdx }: { sectionIdx: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrentRef = useRef({ x: 0.5, y: 0.5 });
  const scrollVeloRef = useRef(0);
  const { onScroll } = useLenis();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollVelo: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
      uColorA: { value: new THREE.Color(...SECTION_PALETTES[0].a) },
      uColorB: { value: new THREE.Color(...SECTION_PALETTES[0].b) },
      uColorC: { value: new THREE.Color(...SECTION_PALETTES[0].c) },
      uBaseBg: { value: new THREE.Color(...SECTION_PALETTES[0].bg) },
      uMorph: { value: 0 },
      uLightMode: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / Math.max(window.innerWidth, 1),
        y: 1.0 - e.clientY / Math.max(window.innerHeight, 1),
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let lastScroll = 0;
    return onScroll((e) => {
      const delta = e.scroll - lastScroll;
      lastScroll = e.scroll;
      scrollVeloRef.current = Math.max(-3, Math.min(3, delta * 0.05));
    });
  }, [onScroll]);

  useEffect(() => {
    if (!matRef.current) return;
    const pal = SECTION_PALETTES[Math.min(Math.max(sectionIdx, 0), SECTION_PALETTES.length - 1)];
    gsap.to(matRef.current.uniforms.uColorA.value, {
      r: pal.a[0],
      g: pal.a[1],
      b: pal.a[2],
      duration: 1.2,
      ease: "power2.out",
    });
    gsap.to(matRef.current.uniforms.uColorB.value, {
      r: pal.b[0],
      g: pal.b[1],
      b: pal.b[2],
      duration: 1.2,
      ease: "power2.out",
    });
    gsap.to(matRef.current.uniforms.uColorC.value, {
      r: pal.c[0],
      g: pal.c[1],
      b: pal.c[2],
      duration: 1.2,
      ease: "power2.out",
    });
    gsap.to(matRef.current.uniforms.uBaseBg.value, {
      r: pal.bg[0],
      g: pal.bg[1],
      b: pal.bg[2],
      duration: 1.0,
      ease: "power2.out",
    });
    gsap.to(matRef.current.uniforms.uMorph, {
      value: pal.morph,
      duration: 1.5,
      ease: "power3.inOut",
    });
    gsap.to(matRef.current.uniforms.uLightMode, {
      value: pal.light,
      duration: 0.9,
      ease: "power2.inOut",
    });
  }, [sectionIdx]);

  useFrame((state, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    scrollVeloRef.current *= 0.92;
    matRef.current.uniforms.uScrollVelo.value = scrollVeloRef.current;

    mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.06;
    mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.06;
    matRef.current.uniforms.uMouse.value.set(
      mouseCurrentRef.current.x,
      mouseCurrentRef.current.y
    );
    matRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BLOB_VERT}
        fragmentShader={BLOB_FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function BackgroundTransition({
  backgroundMedia,
}: {
  backgroundMedia: {
    hero?: MediaPair;
    about?: MediaPair;
    whatWeDo?: MediaPair;
    fullScreenMedia?: MediaPair;
    collaborations?: MediaPair;
    footer?: MediaPair;
  };
}) {
  const sectionIdx = useSectionStore((s) => s.currentSectionIndex);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapRef}
      className="BackgroundTransition_backgroundTransition__uwn48"
    >
      {/* Layer 0: Real-Time Interactive WebGL Organic Fluid Metaball Shader */}
      <div
        className="BackgroundTransition_backgroundTransition_videoWrapper__x676c"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1, left: -1, right: 1, top: 1, bottom: -1 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <OrganicBlobPlane sectionIdx={sectionIdx} />
        </Canvas>
      </div>

      {/* Layer 1: Blended Organic Video Textures (Hue-rotated & screen-blended for depth) */}
      {backgroundMedia.hero?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 0 || sectionIdx === 2 ? 0.42 : 0,
            visibility: sectionIdx <= 3 ? "visible" : "hidden",
            mixBlendMode: "screen",
            filter: "hue-rotate(145deg) saturate(1.3) contrast(1.15)",
            transform: "scaleX(-1) rotate(180deg)",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.hero.videoUrl}
              poster={backgroundMedia.hero.posterUrl}
              playing={sectionIdx === 0 || sectionIdx === 2}
            />
          </div>
        </div>
      )}

      {/* Layer 2: Full Screen Media Reel (Section 5: Collective / Curiosity) */}
      {backgroundMedia.fullScreenMedia?.videoUrl && (
        <div
          className="BackgroundTransition_backgroundTransition_videoWrapper__x676c BackgroundTransition_backgroundTransition_videoWrapper__withTransition__GByzy"
          style={{
            opacity: sectionIdx === 5 ? 0.55 : 0,
            visibility: sectionIdx >= 4 && sectionIdx <= 6 ? "visible" : "hidden",
            mixBlendMode: "lighten",
            filter: "hue-rotate(95deg) contrast(1.1)",
            pointerEvents: "none",
          }}
        >
          <div className="BackgroundTransition_backgroundTransition_mediaLayer__CBc1G">
            <HlsVideo
              src={backgroundMedia.fullScreenMedia.videoUrl}
              poster={backgroundMedia.fullScreenMedia.posterUrl}
              playing={sectionIdx === 5}
            />
          </div>
        </div>
      )}

      {/* Layer 3: Film Grain Noise Texture Overlay across all sections */}
      <div
        className="BackgroundTransition_backgroundTransition_noiseOverlay__XImaj"
        style={{ opacity: sectionIdx === 1 || sectionIdx === 6 ? 0.35 : 0.75 }}
        aria-hidden="true"
      />
    </div>
  );
}
