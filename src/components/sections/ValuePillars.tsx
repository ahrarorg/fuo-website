"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";

const VALUE_KEYS = ["freedom", "dignity", "solidarity", "transparency", "wisdom"] as const;
const VALUE_HUES = ["#e8b84b", "#ff5a6e", "#2dd4bf", "#38d6e0", "#9d7bff"];

export function ValuePillars() {
  const t = useTranslations("mission");
  const locale = useLocale();
  const [open, setOpen] = useState<string | null>("freedom");

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-champagne/12">
      {VALUE_KEYS.map((key, i) => {
        const isOpen = open === key;
        return (
          <div key={key} className={i > 0 ? "border-t border-champagne/10" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : key)}
              aria-expanded={isOpen}
              aria-controls={`value-${key}`}
              className={`flex w-full items-center gap-5 px-6 py-5 text-start transition-colors duration-300 sm:px-8 ${
                isOpen ? "bg-surface/80" : "hover:bg-surface/40"
              }`}
            >
              <span className="num text-sm" style={{ color: VALUE_HUES[i] }}>
                {formatNumber(i + 1, locale, { minimumIntegerDigits: 2 })}
              </span>
              <span className={`text-lg font-bold transition-colors sm:text-xl ${isOpen ? "text-gold" : "text-ivory"}`}>
                {t(`values.${key}.name`)}
              </span>
              <span
                className={`ms-auto grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                  isOpen ? "rotate-45 border-gold/60 text-gold" : "border-champagne/20 text-muted"
                }`}
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`value-${key}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-champagne/8 px-6 py-6 text-sm leading-8 text-muted sm:px-8 sm:ps-[4.7rem]">
                    {t(`values.${key}.text`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}