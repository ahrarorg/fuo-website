"use client";

import { useEffect } from "react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { usePathname } from "@/i18n/navigation";

let lenisInstance: Lenis | null = null;
let scrollTrigger: typeof ScrollTriggerType | null = null;

type Lenis = import("lenis").default;

export function getLenis() {
  return lenisInstance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 + 24);
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration: 1.2 });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    // GSAP + Lenis evaluate off the critical path; the loader gate covers the gap.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      scrollTrigger = ScrollTrigger;
      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false,
      });
      lenisInstance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisInstance = null;
        scrollTrigger = null;
      };
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const lenis = lenisInstance;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const st = scrollTrigger;
    const t = requestAnimationFrame(() => st?.refresh());
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return <>{children}</>;
}