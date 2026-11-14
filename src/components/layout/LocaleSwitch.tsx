"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { pulseScatter } from "@/lib/astrolabe";

export function LocaleSwitch({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "fa" ? "en" : "fa";

  return (
    <button
      type="button"
      className={`font-en text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors duration-300 px-2 py-1 ${className}`}
      onClick={() => {
        pulseScatter();
        router.replace(pathname, { locale: next });
      }}
      aria-label={t("switchLang")}
    >
      {t("switchLang")}
    </button>
  );
}