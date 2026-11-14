"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AstrolabeStage } from "@/components/three/AstrolabeStage";
import { SceneControls } from "@/components/three/SceneControls";
import { DeptGlyph } from "@/components/ui/DeptGlyph";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import {
  getFocusSnapshot,
  sceneState,
  setSceneFocus,
  subscribeFocus,
} from "@/lib/astrolabe";
import { formatNumber } from "@/lib/format";

function DepartmentList() {
  const depts = useTranslations("departments");
  const locale = useLocale();
  const focus = useSyncExternalStore(subscribeFocus, getFocusSnapshot, getFocusSnapshot);

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {DEPARTMENT_SLUGS.map((slug, i) => (
        <li key={slug}>
          <Link
            href={`/programs#${slug}`}
            onMouseEnter={() => setSceneFocus(i)}
            onFocus={() => setSceneFocus(i)}
            className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
              focus === i
                ? "border-gold/50 bg-surface/90"
                : "border-champagne/10 bg-obsidian/40 hover:border-champagne/30"
            }`}
          >
            <span className="num w-6 text-xs text-muted">
              {formatNumber(i + 1, locale, { minimumIntegerDigits: 2 })}
            </span>
            <span style={{ color: DEPARTMENT_HUES[slug] }}>
              <DeptGlyph slug={slug} size={20} />
            </span>
            <span className="text-sm text-champagne/90 group-hover:text-ivory transition-colors">
              {depts(`items.${slug}.short`)}
            </span>
            <span
              className="ms-auto h-px w-5 transition-all duration-300 group-hover:w-8"
              style={{ backgroundColor: DEPARTMENT_HUES[slug] }}
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FocusReadout() {
  const stage = useTranslations("stage");
  const depts = useTranslations("departments");
  const focus = useSyncExternalStore(subscribeFocus, getFocusSnapshot, getFocusSnapshot);
  const slug = focus >= 0 ? DEPARTMENT_SLUGS[focus] : null;

  return (
    <div className="card mt-6 min-h-44 !rounded-2xl p-5" aria-live="polite">
      {slug ? (
        <div key={slug} className="readout-in">
          <div className="flex items-center gap-3">
            <span style={{ color: DEPARTMENT_HUES[slug] }}>
              <DeptGlyph slug={slug} size={26} />
            </span>
            <h3 className="text-base font-bold text-ivory">{depts(`items.${slug}.name`)}</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">{depts(`items.${slug}.description`)}</p>
          <Link
            href={`/programs#${slug}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: DEPARTMENT_HUES[slug] }}
          >
            {stage("readoutCta")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      ) : (
        <p className="flex h-full min-h-32 items-center justify-center text-sm text-muted">
          {stage("focusHint")}
        </p>
      )}
    </div>
  );
}

export function HomeHero() {
  const t = useTranslations("hero");
  const stage = useTranslations("stage");
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    sceneState.reducedMotion = mq.matches;
  }, []);

  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    if (sessionStorage.getItem("fuo-loaded")) {
      setEntered(true);
      return;
    }
    const start = () => setEntered(true);
    window.addEventListener("fuo:loaded", start, { once: true });
    return () => window.removeEventListener("fuo:loaded", start);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              sceneState.openTarget = Math.min(1, Math.max(0, (self.progress - 0.08) / 0.5));
            },
          },
        });
        tl.to(heroRef.current, { autoAlpha: 0, y: -50, duration: 0.25, ease: "power1.in" }, 0.04);
        tl.fromTo(
          deptRef.current,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power1.out" },
          0.45,
        );
      }, sectionRef);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
      sceneState.openTarget = 0;
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? "auto" : "260vh" }}
      aria-label={t("eyebrow")}
    >
      <div
        className={
          reduced
            ? "relative flex min-h-svh flex-col justify-center overflow-hidden"
            : "sticky top-0 h-svh overflow-hidden"
        }
      >
        <div className="aurora absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0">
          <AstrolabeStage />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(11,10,8,0.82) 0%, rgba(11,10,8,0.45) 52%, transparent 78%)",
          }}
          aria-hidden="true"
        />

        <div
          ref={heroRef}
          className={`pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center ${
            entered ? "entered" : ""
          } ${reduced ? "min-h-svh py-28" : ""}`}
        >
          <p className="hero-item eyebrow" style={{ transitionDelay: "0.1s" }}>
            {t("eyebrow")}
          </p>
          <h1 className="h-display mt-5 text-ivory">
            {t("titleA")}
            <span className="block bg-linear-to-b from-gold-hot via-gold to-gold-deep bg-clip-text text-transparent">
              {t("titleB")}
            </span>
          </h1>
          <p className="hero-item lead mt-6 max-w-2xl text-muted" style={{ transitionDelay: "0.36s" }}>
            {t("lead")}
          </p>
          <div className="hero-item mt-9 flex flex-wrap items-center justify-center gap-4" style={{ transitionDelay: "0.5s" }}>
            <Link href="/join" className="btn-gold pointer-events-auto">
              {t("ctaPrimary")}
            </Link>
            <Link href="/programs" className="btn-ghost pointer-events-auto">
              {t("ctaSecondary")}
            </Link>
          </div>
          <div
            className="hero-item absolute inset-x-0 bottom-14 flex items-center justify-center gap-8 text-[0.68rem] text-muted"
            style={{ transitionDelay: "0.7s" }}
          >
            <span className="hidden items-center gap-2 pointer-fine:inline-flex">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <rect x="8" y="3" width="8" height="14" rx="4" />
                <path d="M12 6v3" />
              </svg>
              {t("dragHint")}
            </span>
            <span className="inline-flex items-center gap-2">
              {t("scrollHint")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="animate-bounce" aria-hidden="true">
                <path d="M12 4v16M6 14l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        {!reduced && (
          <div
            ref={deptRef}
            className="pointer-events-none absolute inset-0 z-10 overflow-y-auto"
            style={{ visibility: "hidden" }}
          >
            <div className="shell-wide flex min-h-full items-center pb-24 pt-[calc(var(--nav-h)+2rem)]">
              <div className="grid w-full items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                <div className="pointer-events-auto">
                  <h2 className="h2 text-ivory">{stage("title")}</h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-muted">{stage("lead")}</p>
                  <FocusReadout />
                </div>
                <div className="pointer-events-auto">
                  <DepartmentList />
                </div>
              </div>
            </div>
          </div>
        )}

        {!reduced && <SceneControls />}
      </div>

      {reduced && (
        <div className="shell-wide section-pad">
          <h2 className="h2 text-ivory">{stage("title")}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{stage("lead")}</p>
          <div className="mt-8">
            <DepartmentList />
          </div>
        </div>
      )}
    </section>
  );
}