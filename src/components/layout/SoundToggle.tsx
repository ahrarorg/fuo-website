"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { setAmbient } from "@/lib/audio";

export function SoundToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fuo-sound") !== "1") return;
    setOn(true);
    const resume = () => setAmbient(true);
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setAmbient(next);
    localStorage.setItem("fuo-sound", next ? "1" : "0");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t("soundOff") : t("soundOn")}
      title={on ? t("soundOff") : t("soundOn")}
      className={`relative grid size-9 place-items-center rounded-full border transition-colors duration-300 ${
        on
          ? "border-gold/60 text-gold"
          : "border-champagne/15 text-muted hover:text-champagne hover:border-champagne/30"
      } ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" />
        {on ? (
          <>
            <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
            <path d="M18 6.8a7.6 7.6 0 0 1 0 10.4" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
      {on && (
        <span className="absolute -top-0.5 -end-0.5 size-2 rounded-full bg-gold animate-pulse" aria-hidden="true" />
      )}
    </button>
  );
}