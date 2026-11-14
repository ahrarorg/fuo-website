"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[80] h-[2px] bg-transparent" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full w-full origin-[left_center] bg-gradient-to-r from-gold-deep via-gold to-gold-hot rtl:origin-[right_center]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}