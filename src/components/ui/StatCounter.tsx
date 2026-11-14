"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { formatNumber } from "@/lib/format";

export function StatCounter({
  value,
  suffix = "",
  duration = 1700,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        if (reduced) {
          setDisplay(value);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="num">
      {formatNumber(display, locale)}
      {suffix}
    </span>
  );
}