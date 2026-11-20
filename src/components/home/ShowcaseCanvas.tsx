"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

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

const SHOWCASE_VERT = `
  uniform sampler2D uDisplacementMap;
  uniform float uVertexStrength;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 center = vec2(0.5);

    float mouseDisp = texture2D(uDisplacementMap, uv).r;
    pos.z += mouseDisp * uVertexStrength;

    if (uProgress > 0.001 && uProgress < 0.999) {
      float dist = distance(uv, center);
      float waveProgress = smoothstep(0.0, 1.0, uProgress);
      float rippleRadius = waveProgress;
      float rippleThickness = 0.15;
      float wave = smoothstep(rippleRadius, rippleRadius - rippleThickness, dist) *
                   smoothstep(rippleRadius - rippleThickness * 2.0, rippleRadius - rippleThickness, dist);
      float waveIntensity = smoothstep(0.0, 0.2, uProgress) * smoothstep(1.0, 0.6, uProgress);
      pos.z += wave * uVertexStrength * 1.5 * waveIntensity;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const SHOWCASE_FRAG = `
  uniform sampler2D uTexture;
  uniform sampler2D uTextureNext;
  uniform sampler2D uDisplacementMap;
  uniform float uDistortionStrength;
  uniform float uProgress;
  uniform float uOpacity;
  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;
  varying vec2 vUv;

  vec2 backgroundCoverUv(vec2 meshSize, vec2 imageSize, vec2 uv) {
    if (imageSize.x <= 0.0 || imageSize.y <= 0.0 || meshSize.x <= 0.0 || meshSize.y <= 0.0) return uv;
    float meshRatio = meshSize.x / meshSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    if (meshRatio > imageRatio) {
      return vec2(uv.x, (uv.y - 0.5) * (imageRatio / meshRatio) + 0.5);
    } else {
      return vec2((uv.x - 0.5) * (meshRatio / imageRatio) + 0.5, uv.y);
    }
  }

  void main() {
    vec2 uv = vUv;
    vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
    vec2 center = vec2(0.5);
    float dist = distance(uv, center);

    vec2 texelSize = vec2(1.0 / 64.0);
    float hL = texture2D(uDisplacementMap, uv - vec2(texelSize.x, 0.0)).r;
    float hR = texture2D(uDisplacementMap, uv + vec2(texelSize.x, 0.0)).r;
    float hT = texture2D(uDisplacementMap, uv - vec2(0.0, texelSize.y)).r;
    float hB = texture2D(uDisplacementMap, uv + vec2(0.0, texelSize.y)).r;
    vec2 mouseNormalOffset = vec2(hL - hR, hT - hB);

    float waveProgress = smoothstep(0.0, 1.0, uProgress);
    float rippleRadius = waveProgress;
    float waveIntensity = smoothstep(0.0, 0.2, uProgress) * smoothstep(1.0, 0.6, uProgress);

    float wavePattern = sin((dist - rippleRadius) * 8.0) * waveIntensity * 0.15;
    vec2 waveNormalOffset = normalize(uv - center + 0.0001) * wavePattern;

    vec2 distortion = (mouseNormalOffset + waveNormalOffset) * uDistortionStrength;

    float rippleThickness = 0.15;
    float mask = smoothstep(rippleRadius - rippleThickness, rippleRadius, dist);
    float maskWave = sin((dist - rippleRadius) * 6.0) * 0.5 + 0.5;
    mask = mix(mask, mask * (1.0 - maskWave * 0.35), waveIntensity);
    mask = clamp(mask, 0.0, 1.0);

    vec4 tex1 = texture2D(uTexture, texUv + distortion);
    vec4 tex2 = texture2D(uTextureNext, texUv + distortion);

    vec4 finalColor = mix(tex2, tex1, mask);
    vec2 totalNormal = mouseNormalOffset + waveNormalOffset;
    finalColor.rgb *= clamp(1.0 - length(totalNormal) * 0.6, 0.6, 1.0);
    finalColor.a *= uOpacity;

    gl_FragColor = finalColor;
  }
`;

function ShowcasePlane({
  imageUrls,
  activeIndex,
  onClick,
}: {
  imageUrls: string[];
  activeIndex: number;
  onClick: () => void;
}) {
  const safeUrls = useMemo(
    () => (imageUrls.length > 0 ? imageUrls : ["/images/test.jpg"]),
    [imageUrls]
  );
  const textures = useTexture(safeUrls) as THREE.Texture[];
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const currentIdxRef = useRef(0);
  const progressRef = useRef({ value: 0 });
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

  const mainUniforms = useMemo(
    () => ({
      uTexture: { value: textures[0] ?? null },
      uTextureNext: { value: textures[0] ?? null },
      uDisplacementMap: { value: fboA.texture },
      uDistortionStrength: { value: 0.2 },
      uVertexStrength: { value: 0.12 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uMeshSize: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(16, 10) },
    }),
    [textures, fboA]
  );

  useEffect(() => {
    const tex = textures[activeIndex] ?? textures[0];
    if (!tex || !matRef.current) return;
    if (currentIdxRef.current === activeIndex) {
      matRef.current.uniforms.uTexture.value = tex;
      matRef.current.uniforms.uTextureNext.value = tex;
      return;
    }
    matRef.current.uniforms.uTextureNext.value = tex;
    progressRef.current.value = 0;
    gsap.killTweensOf(progressRef.current);
    gsap.to(progressRef.current, {
      value: 1,
      duration: 1.0,
      ease: "power2.inOut",
      onComplete: () => {
        if (matRef.current) {
          matRef.current.uniforms.uTexture.value = tex;
          progressRef.current.value = 0;
        }
        currentIdxRef.current = activeIndex;
      },
    });
  }, [activeIndex, textures]);

  useFrame(({ gl, size }) => {
    if (!matRef.current) return;
    const readFbo = currentFbo.current;
    const writeFbo = readFbo === fboA ? fboB : fboA;
    simUniforms.uTexture.value = readFbo.texture;
    gl.setRenderTarget(writeFbo);
    gl.render(simScene, simCam);
    gl.setRenderTarget(null);
    currentFbo.current = writeFbo;

    matRef.current.uniforms.uDisplacementMap.value = writeFbo.texture;
    matRef.current.uniforms.uProgress.value = progressRef.current.value;
    matRef.current.uniforms.uMeshSize.value.set(size.width, size.height);
    const activeTex = textures[activeIndex] ?? textures[0];
    const img = activeTex?.image as HTMLImageElement | undefined;
    if (img?.naturalWidth && img?.naturalHeight) {
      matRef.current.uniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
    }
  });

  return (
    <>
      <mesh
        onClick={onClick}
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
        <planeGeometry args={[2, 2, 48, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={SHOWCASE_VERT}
          fragmentShader={SHOWCASE_FRAG}
          uniforms={mainUniforms}
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
}

export function ShowcaseCanvas({
  imageUrls,
  activeIndex,
  onClick,
}: {
  imageUrls: string[];
  activeIndex: number;
  onClick: () => void;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 1, left: -1, right: 1, top: 1, bottom: -1 }}
      style={{ width: "100%", height: "100%", cursor: "pointer" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ShowcasePlane imageUrls={imageUrls} activeIndex={activeIndex} onClick={onClick} />
    </Canvas>
  );
}
