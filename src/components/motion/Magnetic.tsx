"use client";

import { useEffect, useRef } from "react";

export function Magnetic({
  children,
  className = "",
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    const dt = 1 / 60;
    const step = () => {
      vx += (((tx - x) * 180 - vx * 14) / 0.4) * dt;
      vy += (((ty - y) * 180 - vy * 14) / 0.4) * dt;
      x += vx * dt;
      y += vy * dt;
      const settled = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) < 0.05;
      el.style.transform = settled && !tx && !ty ? "" : `translate3d(${x}px, ${y}px, 0)`;
      raf = settled ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * strength;
      ty = (e.clientY - r.top - r.height / 2) * strength;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}