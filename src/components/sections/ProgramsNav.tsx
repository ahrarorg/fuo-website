"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import { scrollToId } from "@/components/motion/MotionProvider";

function useActiveOrbit() {
  const [active, setActive] = useState<string>(DEPARTMENT_SLUGS[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    DEPARTMENT_SLUGS.forEach((slug) => {
      const el = document.getElementById(slug);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return [active, setActive] as const;
}

export function ProgramsChips() {
  const depts = useTranslations("departments");
  const [active, setActive] = useActiveOrbit();
  return (
    <div className="sticky top-[var(--nav-h)] z-30 overflow-x-auto border-b border-champagne/10 bg-obsidian/90 backdrop-blur-md lg:hidden">
      <div className="flex w-max gap-2 px-4 py-3">
        {DEPARTMENT_SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => {
              setActive(slug);
              scrollToId(slug);
            }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs transition-colors duration-300 ${
              active === slug
                ? "border-gold/60 bg-surface text-gold"
                : "border-champagne/12 text-champagne/70"
            }`}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: DEPARTMENT_HUES[slug] }} aria-hidden="true" />
            {depts(`items.${slug}.short`)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProgramsRail() {
  const depts = useTranslations("departments");
  const [active, setActive] = useActiveOrbit();
  return (
    <nav aria-label={depts("title")} className="sticky top-[calc(var(--nav-h)+2rem)] hidden self-start lg:block">
      <ul className="space-y-1 border-s border-champagne/12 ps-4">
        {DEPARTMENT_SLUGS.map((slug) => (
          <li key={slug}>
            <button
              type="button"
              onClick={() => {
                setActive(slug);
                scrollToId(slug);
              }}
              aria-current={active === slug ? "true" : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-all duration-300 ${
                active === slug ? "bg-surface/80 text-ivory" : "text-muted hover:text-champagne"
              }`}
            >
              <span
                className={`h-px transition-all duration-300 ${active === slug ? "w-6" : "w-3 group-hover:w-5"}`}
                style={{ backgroundColor: DEPARTMENT_HUES[slug] }}
                aria-hidden="true"
              />
              {depts(`items.${slug}.short`)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}