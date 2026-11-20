"use client";

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAppStore, useMenuStore, useSectionStore } from "@/stores/appStore";
import {
  usePagePrefetch,
  usePageReady,
  useRouterTransition,
} from "@/hooks/usePageLifecycle";

gsap.registerPlugin(useGSAP);

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uProgress;
  uniform float uOpacity;
  uniform float uDistortionStrength;
  uniform float uNoiseScale;
  uniform vec3 uColor;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    if (uOpacity <= 0.0) {
      gl_FragColor = vec4(uColor, 0.0);
      return;
    }
    if (uProgress <= 0.0) {
      gl_FragColor = vec4(uColor, 0.0);
      gl_FragColor.a *= uOpacity;
      return;
    }
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    float noiseValue = snoise(vUv * uNoiseScale);
    float distortedDist = dist - noiseValue * uDistortionStrength;
    float rippleRadius = uProgress * .85;
    float edgeWidth = 0.05;
    float mask = smoothstep(rippleRadius, rippleRadius - edgeWidth, distortedDist);
    if (uProgress >= 1.0) {
      gl_FragColor = vec4(uColor, 1.0 * uOpacity);
      return;
    }
    gl_FragColor = vec4(uColor, mask * uOpacity);
  }
`;

function hexToRgb(hex: string) {
  const num = parseInt(hex.slice(1), 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function getRouteColor(path: string) {
  const clean = path.replace(/^\/+/, "").toLowerCase() || "home";
  if (clean === "lab") return hexToRgb("#fffde2");
  if (clean === "jobs") return hexToRgb("#182e2f");
  return hexToRgb("#051236");
}

function TransitionPlane({
  progressRef,
  opacityRef,
  meshColorRef,
}: {
  progressRef: React.RefObject<number>;
  opacityRef: React.RefObject<number>;
  meshColorRef: React.MutableRefObject<{ r: number; g: number; b: number } | null>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uDistortionStrength: { value: 0.08 },
      uNoiseScale: { value: 2.2 },
      uColor: { value: new THREE.Color(1, 1, 1) },
    }),
    []
  );

  useFrame(() => {
    if (matRef.current) {
      if (meshColorRef.current) {
        const c = meshColorRef.current;
        matRef.current.uniforms.uColor.value.set(c.r, c.g, c.b);
        meshColorRef.current = null;
      }
      matRef.current.uniforms.uProgress.value = progressRef.current;
      matRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });

  const scale = useMemo<[number, number, number]>(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const z = cam.position.z;
    const h = 2 * Math.tan(((cam.fov * Math.PI) / 180) / 2) * z;
    return [h * (size.width / size.height), h, 1];
  }, [camera, size]);

  return (
    <mesh scale={scale} renderOrder={999}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function PageEffect() {
  const canvasWrapRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const opacityRef = useRef(1);
  const colorRef = useRef<{ r: number; g: number; b: number } | null>(null);
  const isLeavingRef = useRef(false);
  const isEnteringRef = useRef(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingElRef = useRef<HTMLDivElement>(null);
  const [showGif, setShowGif] = useState(false);

  const { routerPrefetch, routerPush } = useRouterTransition();
  const { contextSafe } = useGSAP();

  const hideLoadingGif = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (loadingElRef.current) {
      gsap.to(loadingElRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        onComplete: () => setShowGif(false),
      });
    } else {
      setShowGif(false);
    }
  }, []);

  const animateOut = useCallback(
    contextSafe(() => {
      const canvas = canvasWrapRef.current;
      if (!canvas) {
        routerPush();
        useMenuStore.getState().setIsOpen(false);
        return;
      }
      colorRef.current = getRouteColor(
        useAppStore.getState().routerState.pathName ?? ""
      );
      canvas.style.visibility = "visible";
      canvas.style.pointerEvents = "auto";
      progressRef.current = 0;
      opacityRef.current = 1;
      isLeavingRef.current = false;
      isEnteringRef.current = false;

      const tweenObj = { value: 0 };
      gsap.to(tweenObj, {
        value: 1,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          progressRef.current = tweenObj.value;
        },
        onComplete: () => {
          isLeavingRef.current = true;
          routerPush();
          useMenuStore.getState().setIsOpen(false);
          loadingTimerRef.current = setTimeout(() => setShowGif(true), 200);
        },
      });
    }),
    [routerPush]
  );

  const animateIn = useCallback(
    contextSafe(() => {
      if (isEnteringRef.current) return;
      isEnteringRef.current = true;
      progressRef.current = 1;
      opacityRef.current = 1;
      hideLoadingGif();
      useMenuStore.getState().setIsOpen(false);

      const tweenObj = { value: 1 };
      useAppStore.getState().setPlayVideo();
      gsap.to(tweenObj, {
        value: 0,
        duration: 0.8,
        ease: "power3.inOut",
        onUpdate: () => {
          opacityRef.current = tweenObj.value;
        },
        onComplete: () => {
          opacityRef.current = 0;
          if (canvasWrapRef.current) {
            canvasWrapRef.current.style.visibility = "hidden";
            canvasWrapRef.current.style.pointerEvents = "none";
          }
          useAppStore.getState().pagePlay();
          setTimeout(() => {
            useSectionStore.setState({ currentSectionIndex: 1 });
            useAppStore.getState().pageEnter();
          }, 100);
          isLeavingRef.current = false;
          isEnteringRef.current = false;
        },
      });
    }),
    [hideLoadingGif]
  );

  usePagePrefetch(() => {
    const effect = useAppStore.getState().routerState.typeEffect;
    if (effect === "none" || effect === "history") {
      if (effect === "history") routerPush();
      return;
    }
    animateOut();
  });

  usePageReady(() => {
    colorRef.current = getRouteColor(
      useAppStore.getState().routerState.pathName ?? ""
    );
    progressRef.current = 1;
    const effect = useAppStore.getState().routerState.typeEffect;
    if (effect === "none" || effect === "history") {
      useAppStore.getState().setPlayVideo();
      useAppStore.getState().pagePlay();
      setTimeout(useAppStore.getState().pageEnter, 100);
      return;
    }
    if (canvasWrapRef.current) {
      canvasWrapRef.current.style.visibility = "visible";
      canvasWrapRef.current.style.pointerEvents = "auto";
    }
    requestAnimationFrame(() => animateIn());
  });

  useLayoutEffect(() => {
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    const onNavigate = (e: Event) => {
      const evt = e as Event & {
        destination?: { url: string };
        navigationType?: string;
      };
      if (!evt.destination?.url.includes(document.location.origin)) return;
      let nextPath = evt.destination.url.replace(document.location.origin, "");
      if (nextPath === "") nextPath = "/";
      if (evt.navigationType === "traverse") {
        routerPrefetch({ pathName: nextPath, typeEffect: "history" });
      }
    };
    nav?.addEventListener?.("navigate", onNavigate);
    return () => nav?.removeEventListener?.("navigate", onNavigate);
  }, [routerPrefetch]);

  return (
    <>
      <Canvas
        ref={canvasWrapRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        gl={{ alpha: true }}
      >
        <TransitionPlane
          progressRef={progressRef}
          opacityRef={opacityRef}
          meshColorRef={colorRef}
        />
      </Canvas>
      {showGif && (
        <div ref={loadingElRef} className="PageEffect_pageEffect_loading__0gpe_">
          <div className="PageEffect_pageEffect_loading_gif__m4Dmq">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/loading.gif"
              alt="Loading"
              className="PageEffect_pageEffect_loading_gifImg__A34bs"
            />
          </div>
        </div>
      )}
    </>
  );
}
