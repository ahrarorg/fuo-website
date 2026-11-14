"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate, formatNumber } from "@/lib/format";

type NewsItem = {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  body: string[];
};

const CATEGORY_KEYS = ["peace", "tech", "development", "org"] as const;
const CATEGORY_HUES: Record<string, string> = {
  tech: "#38d6e0",
  peace: "#86c66b",
  development: "#3ed598",
  org: "#5b8cff",
};

export function NewsIndex() {
  const t = useTranslations("news");
  const locale = useLocale();
  const items = t.raw("items") as NewsItem[];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.body.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [items, query, category]);

  return (
    <div className="shell section-pad">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("title")}>
          {["all", ...CATEGORY_KEYS].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors duration-300 ${
                category === key
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-champagne/12 text-champagne/70 hover:border-champagne/30 hover:text-ivory"
              }`}
            >
              {key === "all" ? t("all") : t(`categories.${key}`)}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-champagne/15 bg-obsidian/60 py-2.5 pe-4 ps-11 text-sm text-ivory placeholder:text-muted/60 transition-colors focus:border-gold/60 focus:outline-none"
          />
        </label>
      </div>

      <p aria-live="polite" className="mt-6 text-xs text-muted">
        {formatNumber(filtered.length, locale)} / {formatNumber(items.length, locale)}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 2) * 90} as="article">
              <Link href={`/news/${item.slug}`} className="card group flex h-full flex-col !rounded-2xl p-7">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full border px-3 py-1 text-[0.65rem]"
                    style={{
                      color: CATEGORY_HUES[item.category],
                      borderColor: `${CATEGORY_HUES[item.category]}55`,
                    }}
                  >
                    {t(`categories.${item.category}`)}
                  </span>
                  <time dateTime={item.date} className="num text-xs text-muted">
                    {formatDate(item.date, locale)}
                  </time>
                </div>
                <h2 className="mt-4 text-xl font-bold leading-9 text-ivory transition-colors group-hover:text-gold">
                  {item.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted">{item.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 text-gold/80">
                    {t("readMore")}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span className="num text-muted">
                    {formatNumber(item.readMinutes, locale)} {t("minRead")}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}