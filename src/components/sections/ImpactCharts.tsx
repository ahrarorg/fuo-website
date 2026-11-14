"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import { formatNumber } from "@/lib/format";

export function OrbitChart({ values }: { values: number[] }) {
  const t = useTranslations("impact");
  const depts = useTranslations("departments");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const max = Math.max(...values);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-10 space-y-3">
      {DEPARTMENT_SLUGS.map((slug, i) => (
        <div key={slug} className="grid grid-cols-[minmax(7rem,11rem)_1fr_3rem] items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-2 truncate text-xs text-champagne/85 sm:text-sm">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: DEPARTMENT_HUES[slug] }} aria-hidden="true" />
            {depts(`items.${slug}.short`)}
          </span>
          <div className="h-5 overflow-hidden rounded-full bg-surface/80">
            <div
              className="h-full rounded-full"
              style={{
                width: inView ? `${(values[i] / max) * 100}%` : "0%",
                background: `linear-gradient(90deg, ${DEPARTMENT_HUES[slug]}55, ${DEPARTMENT_HUES[slug]})`,
                transition: `width 1.1s var(--ease-orbit) ${i * 70}ms`,
              }}
              aria-hidden="true"
            />
          </div>
          <span className="num text-end text-sm font-bold" style={{ color: DEPARTMENT_HUES[slug] }}>
            {formatNumber(values[i], locale)}
          </span>
        </div>
      ))}
      <p className="pt-2 text-xs text-muted">{t("chartUnit")}</p>
    </div>
  );
}

export function ReportDownload() {
  const t = useTranslations("impact");
  const depts = useTranslations("departments");
  const locale = useLocale();

  const download = () => {
    const stats = t.raw("stats") as { value: number; suffix: string; label: string }[];
    const values = t.raw("chartValues") as number[];
    const allocation = t.raw("allocation") as { label: string; percent: number }[];
    const rows: string[][] = [["section", "label", "value"]];
    stats.forEach((s) => rows.push(["stats", s.label, `${s.value}${s.suffix}`]));
    DEPARTMENT_SLUGS.forEach((slug, i) =>
      rows.push(["projects", depts(`items.${slug}.short`), String(values[i])]),
    );
    allocation.forEach((a) => rows.push(["allocation", a.label, `${a.percent}%`]));
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuo-impact-sample-${locale}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={download} className="btn-gold">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
      </svg>
      {t("reportCta")}
    </button>
  );
}