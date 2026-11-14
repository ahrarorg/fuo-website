"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AoMark } from "@/components/ui/AoMark";
import { toPersianDigits } from "@/lib/format";

export function Loader() {
  const t = useTranslations("loader");
  const locale = useLocale();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("fuo-loaded") === "1";
    if (reduced || seen) {
      setVisible(false);
      window.dispatchEvent(new Event("fuo:loaded"));
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    // Drive the counter + bar imperatively: a setState per frame would re-render
    // React ~75x during the critical loading window and inflate blocking time.
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const pct = Math.round(eased * 100);
      if (numRef.current) {
        numRef.current.textContent =
          locale === "fa" ? toPersianDigits(String(pct)) : String(pct);
      }
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let unmount = 0;
    const finish = () => {
      sessionStorage.setItem("fuo-loaded", "1");
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("fuo:loaded"));
      setLeaving(true);
      unmount = window.setTimeout(() => setVisible(false), 750);
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const minWait = new Promise((res) => setTimeout(res, 1200));
    const cap = new Promise((res) => setTimeout(res, 2000));
    void Promise.race([Promise.all([fontsReady, minWait]), cap]).then(finish);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(unmount);
      document.documentElement.style.overflow = "";
    };
  }, [locale]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-obsidian transition-opacity duration-700 ease-[var(--ease-orbit)] ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="loader-mark">
        <AoMark size={92} draw />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span ref={numRef} aria-hidden="true" className="num text-2xl font-bold text-gold">
          {locale === "fa" ? toPersianDigits("0") : "0"}
        </span>
        <span className="eyebrow">{t("label")}</span>
      </div>
      <div className="h-px w-40 overflow-hidden bg-overlay">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-hot"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  );
}