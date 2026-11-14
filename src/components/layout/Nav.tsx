"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AoMark } from "@/components/ui/AoMark";
import { LocaleSwitch } from "./LocaleSwitch";
import { SoundToggle } from "./SoundToggle";

const LINKS = ["home", "about", "mission", "programs", "news", "impact", "contact"] as const;
const HREFS: Record<(typeof LINKS)[number], string> = {
  home: "/",
  about: "/about",
  mission: "/mission",
  programs: "/programs",
  news: "/news",
  impact: "/impact",
  contact: "/contact",
};

export function Nav() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      return;
    }
    const t = setTimeout(() => setRender(false), 380);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (key: (typeof LINKS)[number]) =>
    key === "home" ? pathname === "/" : pathname.startsWith(HREFS[key]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-all duration-500 ${
          scrolled || open
            ? "bg-obsidian/85 backdrop-blur-md border-b border-gold/15"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="shell-wide flex h-full items-center justify-between gap-4" aria-label={brand("name")}>
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <AoMark size={38} className="text-gold transition-transform duration-700 group-hover:rotate-[20deg]" />
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold text-ivory">{brand("short")}</span>
              <span className="mt-1 text-[0.6rem] tracking-[0.28em] text-gold/80 uppercase font-en">
                {brand("tagline")}
              </span>
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {LINKS.map((key) => (
              <li key={key}>
                <Link
                  href={HREFS[key]}
                  aria-current={isActive(key) ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm transition-colors duration-300 ${
                    isActive(key) ? "text-gold" : "text-champagne/75 hover:text-ivory"
                  }`}
                >
                  {t(key)}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-px bg-gold origin-center transition-transform duration-500 ${
                      isActive(key) ? "scale-x-100" : "scale-x-0"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <SoundToggle />
            <LocaleSwitch className="hidden sm:block" />
            <Link
              href="/join"
              className="btn-gold hidden sm:inline-flex !px-5 !py-2 text-sm"
            >
              {t("join")}
            </Link>
            <button
              type="button"
              className="lg:hidden grid size-10 place-items-center rounded-full border border-champagne/15 text-champagne hover:border-gold/50 hover:text-gold transition-colors"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-current transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1.5 h-px bg-current transition-opacity duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-3 h-px bg-current transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Sibling of <header>: the header's backdrop-filter would otherwise
          become the containing block for this fixed drawer (zero height). */}
      {render && (
        <div
          id="mobile-menu"
          className={`lg:hidden fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-40 overflow-y-auto bg-obsidian/97 backdrop-blur-xl transition-[opacity,transform] duration-300 ease-[var(--ease-orbit)] ${
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <ul className="shell flex flex-col gap-1 py-8">
            {[...LINKS, "join" as const].map((key, i) => (
              <li
                key={key}
                style={{ transitionDelay: open ? `${50 + i * 45}ms` : "0ms" }}
                className={`transition-[opacity,transform] duration-300 ease-[var(--ease-orbit)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <Link
                  href={key === "join" ? "/join" : HREFS[key]}
                  aria-current={key !== "join" && isActive(key) ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-champagne/8 py-4 text-xl ${
                    key === "join"
                      ? "text-gold font-bold"
                      : isActive(key as (typeof LINKS)[number])
                        ? "text-gold"
                        : "text-ivory"
                  }`}
                >
                  {t(key)}
                  <span className="num text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="shell flex items-center justify-between pb-10 sm:hidden">
            <LocaleSwitch />
            <span className="text-xs text-muted">{brand("tagline")}</span>
          </div>
        </div>
      )}
    </>
  );
}