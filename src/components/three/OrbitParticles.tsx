"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  RINGS,
  QUALITY_PARTICLES,
  DENSITY_COUNTS,
  scatterEnvelope,
  sceneState,
  sceneParams,
  subscribeParams,
  getParamsSnapshot,
  type Quality,
} from "@/lib/astrolabe";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import { orbitVertex, orbitFragment } from "./shaders";

export function OrbitParticles({ quality }: { quality: Quality }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);
  const params = useSyncExternalStore(subscribeParams, getParamsSnapshot, getParamsSnapshot);
  const count = Math.min(QUALITY_PARTICLES[quality], DENSITY_COUNTS[params.density]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const ring = new Float32Array(count);
    const angle = new Float32Array(count);
    const jitterR = new Float32Array(count);
    const jitterY = new Float32Array(count);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      ring[i] = i % 10;
      angle[i] = Math.random() * Math.PI * 2;
      jitterR[i] = (Math.random() - 0.5) * 0.07;
      jitterY[i] = (Math.random() - 0.5) * 0.06;
      size[i] = 0.5 + Math.random() * 0.95;
      seed[i] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));
    geo.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
    geo.setAttribute("aJitterR", new THREE.BufferAttribute(jitterR, 1));
    geo.setAttribute("aJitterY", new THREE.BufferAttribute(jitterY, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    return geo;
  }, [count]);

  const uniforms = useMemo(() => {
    const gold = new THREE.Color("#e8b84b");
    const colors = DEPARTMENT_SLUGS.map(
      (slug) => gold.clone().lerp(new THREE.Color(DEPARTMENT_HUES[slug]), 0.55),
    );
    return {
      uTime: { value: 0 },
      uOpen: { value: 0 },
      uGlow: { value: 1 },
      uFocus: { value: -1 },
      uFocusStrength: { value: 0 },
      uScatter: { value: 0 },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uIncl: { value: RINGS.map((r) => r.incl) },
      uNode: { value: RINGS.map((r) => r.node) },
      uRadius: { value: RINGS.map((r) => r.radius) },
      uSpeed: { value: RINGS.map((r) => r.speed) },
      uColor: { value: colors },
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const m = materialRef.current;
    if (!m) return;
    const u = m.uniforms;
    timeRef.current += Math.min(delta, 0.05) * sceneParams.speed;
    u.uTime.value = timeRef.current;
    u.uOpen.value = sceneState.open * sceneParams.spread;
    u.uGlow.value = 0.55 + sceneParams.glow * 0.6;
    u.uFocus.value = sceneState.focusTarget;
    u.uFocusStrength.value = sceneState.focusStrength;
    u.uScatter.value = scatterEnvelope(performance.now());
    u.uPixelRatio.value = state.gl.getPixelRatio();
    (u.uPointer.value as THREE.Vector3).set(
      sceneState.pointerWorld.x,
      sceneState.pointerWorld.y,
      sceneState.pointerWorld.z,
    );
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={orbitVertex}
        fragmentShader={orbitFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}