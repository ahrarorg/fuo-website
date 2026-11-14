"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AoMark } from "@/components/ui/AoMark";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import { formatNumber } from "@/lib/format";
import { getLenis } from "@/components/motion/MotionProvider";

const EXPLORE = [
  ["about", "/about"],
  ["mission", "/mission"],
  ["programs", "/programs"],
  ["news", "/news"],
  ["impact", "/impact"],
  ["contact", "/contact"],
  ["join", "/join"],
] as const;

export function Footer({ year }: { year: number }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const brand = useTranslations("brand");
  const depts = useTranslations("departments");
  const contact = useTranslations("contact");
  const join = useTranslations("join");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    localStorage.setItem("fuo-newsletter", email.trim());
    setStatus("success");
    setEmail("");
  };

  const backTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-gold/15 bg-charcoal/60">
      <div className="shell-wide section-pad !pb-10 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <AoMark size={44} className="text-gold" />
            <div>
              <p className="text-lg font-bold text-ivory">{brand("name")}</p>
              <p className="text-xs tracking-[0.25em] text-gold/80 uppercase font-en">{brand("tagline")}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">{t("tagline")}</p>

          <form onSubmit={subscribe} className="mt-7 max-w-sm" noValidate>
            <label htmlFor="footer-newsletter" className="eyebrow">
              {t("newsletterTitle")}
            </label>
            <p className="mt-2 text-xs text-muted">{t("newsletterText")}</p>
            <div className="mt-3 flex overflow-hidden rounded-full border border-champagne/15 bg-obsidian/60 focus-within:border-gold/60 transition-colors">
              <input
                id="footer-newsletter"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder={t("newsletterPh")}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-muted/60 focus:outline-none"
              />
              <button type="submit" className="shrink-0 bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-hot transition-colors">
                {t("newsletterCta")}
              </button>
            </div>
            <p aria-live="polite" className="mt-2 min-h-5 text-xs">
              {status === "success" && <span className="text-success">{t("newsletterSuccess")}</span>}
              {status === "error" && <span className="text-danger">{join("form.errorEmail")}</span>}
            </p>
          </form>
        </div>

        <nav aria-label={t("explore")}>
          <h3 className="eyebrow">{t("explore")}</h3>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE.map(([key, href]) => (
              <li key={key}>
                <Link href={href} className="text-sm text-champagne/75 hover:text-gold transition-colors">
                  {nav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("programsTitle")}>
          <h3 className="eyebrow">{t("programsTitle")}</h3>
          <ul className="mt-4 space-y-2.5">
            {DEPARTMENT_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/programs#${slug}`}
                  className="group flex items-center gap-2 text-sm text-champagne/75 hover:text-gold transition-colors"
                >
                  <span
                    className="size-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ backgroundColor: DEPARTMENT_HUES[slug] }}
                    aria-hidden="true"
                  />
                  {depts(`items.${slug}.short`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow">{t("contactTitle")}</h3>
          <a
            href={`mailto:${contact("emailValue")}`}
            dir="ltr"
            className="mt-4 block font-en text-sm text-champagne/85 hover:text-gold transition-colors"
          >
            {contact("emailValue")}
          </a>
          <p className="mt-2 text-xs text-muted">{contact("responseValue")}</p>

          <h3 className="eyebrow mt-8">{t("transparencyTitle")}</h3>
          <p className="mt-3 text-xs leading-6 text-muted">{t("transparencyText")}</p>
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full" aria-hidden="true">
            <span className="bg-gold" style={{ width: "72%" }} />
            <span className="bg-info" style={{ width: "18%" }} />
            <span className="bg-muted/50" style={{ width: "10%" }} />
          </div>
        </div>
      </div>

      <div className="border-t border-champagne/8">
        <div className="shell-wide flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {t("rights", { year: formatNumber(year, locale, { useGrouping: false }) })}
          </p>
          <p className="max-w-xl text-[0.68rem] leading-5 text-muted">{t("sampleNote")}</p>
          <button
            type="button"
            onClick={backTop}
            className="group inline-flex items-center gap-2 self-start sm:self-auto text-xs text-champagne/75 hover:text-gold transition-colors"
          >
            {t("backTop")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}