"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectQuality, webglAvailable, type Quality } from "@/lib/astrolabe";
import { AstrolabeFallback } from "./AstrolabeFallback";

const AstrolabeScene = dynamic(() => import("./AstrolabeScene"), { ssr: false });

export function AstrolabeStage() {
  const [quality, setQuality] = useState<Quality | null>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !webglAvailable()) return;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let armed = false;
    // Boot after the loader gate + an idle slot so scene evaluation never
    // competes with first paint (LCP) on slow devices.
    const schedule = () => {
      if (typeof requestIdleCallback === "function") {
        idleId = requestIdleCallback(() => setQuality(detectQuality()), { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(() => setQuality(detectQuality()), 300);
      }
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      if (sessionStorage.getItem("fuo-loaded")) schedule();
      else window.addEventListener("fuo:loaded", schedule, { once: true });
    };
    // Touch devices keep the cheap SVG astrolabe for first paint and upgrade
    // to WebGL on first engagement (scroll/touch/key) — battery and LCP win.
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      const opts = { once: true, passive: true };
      window.addEventListener("pointerdown", arm, opts);
      window.addEventListener("wheel", arm, opts);
      window.addEventListener("touchstart", arm, opts);
      window.addEventListener("keydown", arm, opts);
    } else {
      arm();
    }
    return () => {
      window.removeEventListener("fuo:loaded", schedule);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("keydown", arm);
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (quality === null) return <AstrolabeFallback />;
  return <AstrolabeScene quality={quality} />;
}