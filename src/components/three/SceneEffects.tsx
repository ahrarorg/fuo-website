"use client";

import type { RefObject } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { BloomEffect, EffectComposer as ComposerImpl } from "postprocessing";

export default function SceneEffects({
  bloomRef,
  composerRef,
}: {
  bloomRef: RefObject<BloomEffect | null>;
  composerRef: RefObject<ComposerImpl | null>;
}) {
  return (
    <EffectComposer ref={composerRef} multisampling={0}>
      <Bloom
        ref={bloomRef}
        intensity={0.75}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.16} darkness={0.72} />
    </EffectComposer>
  );
}