"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { BloomEffect, EffectComposer as ComposerImpl } from "postprocessing";
import { useRouter } from "@/i18n/navigation";
import { sceneParams, type Quality } from "@/lib/astrolabe";
import { SceneRig } from "./SceneRig";
import { StarDust } from "./StarDust";

// Postprocessing stays out of the low-tier bundle entirely.
const SceneEffects = dynamic(() => import("./SceneEffects"), { ssr: false });

// Bloom intensity is driven per-frame through a ref: passing it as a prop
// would rebuild the effect on every slider tick.
function SceneBridge({
  bloomRef,
  composerRef,
}: {
  bloomRef: RefObject<BloomEffect | null>;
  composerRef: RefObject<ComposerImpl | null>;
}) {
  const { gl, scene, camera } = useThree();

  useFrame(() => {
    if (bloomRef.current) bloomRef.current.intensity = sceneParams.glow;
  });

  useEffect(() => {
    const onSnapshot = () => {
      if (composerRef.current) composerRef.current.render(0);
      else gl.render(scene, camera);
      const a = document.createElement("a");
      a.href = gl.domElement.toDataURL("image/png");
      a.download = "fuo-astrolabe.png";
      a.click();
    };
    window.addEventListener("fuo:snapshot", onSnapshot);
    return () => window.removeEventListener("fuo:snapshot", onSnapshot);
  }, [gl, scene, camera, composerRef]);

  return null;
}

export default function AstrolabeScene({ quality }: { quality: Quality }) {
  const router = useRouter();
  const bloomRef = useRef<BloomEffect | null>(null);
  const composerRef = useRef<ComposerImpl | null>(null);
  const onNavigate = useCallback(
    (slug: string) => router.push(`/programs#${slug}`),
    [router],
  );
  const maxDpr = quality === "low" ? 1 : quality === "medium" ? 1.5 : 2;

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ fov: 42, position: [0, 0, 8.4], near: 0.1, far: 80 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <SceneBridge bloomRef={bloomRef} composerRef={composerRef} />
      <SceneRig quality={quality} onNavigate={onNavigate} />
      <StarDust quality={quality} />
      {quality !== "low" && <SceneEffects bloomRef={bloomRef} composerRef={composerRef} />}
    </Canvas>
  );
}