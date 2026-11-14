"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  getParamsSnapshot,
  randomizeSceneParams,
  resetSceneParams,
  setSceneParam,
  subscribeParams,
  webglAvailable,
} from "@/lib/astrolabe";

const SLIDERS = [
  { key: "speed", min: 0, max: 2, step: 0.05 },
  { key: "glow", min: 0, max: 1.5, step: 0.05 },
  { key: "spread", min: 0, max: 1.5, step: 0.05 },
  { key: "distance", min: 6, max: 12, step: 0.1 },
] as const;

const ACTION_BTN =
  "shrink-0 rounded-full border border-champagne/20 px-3 py-1 text-[0.68rem] text-champagne/80 transition-colors hover:border-gold/50 hover:text-gold";

export function SceneControls() {
  const t = useTranslations("controls");
  const params = useSyncExternalStore(subscribeParams, getParamsSnapshot, getParamsSnapshot);
  const [available, setAvailable] = useState(false);

  useEffect(() => setAvailable(webglAvailable()), []);
  if (!available) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-gold/15 bg-obsidian/80 backdrop-blur-md">
      <div
        role="group"
        aria-label={t("title")}
        className="shell-wide flex items-center gap-4 overflow-x-auto py-2.5 sm:gap-5"
      >
        <span className="hidden shrink-0 font-en text-[0.6rem] uppercase tracking-[0.24em] text-gold/70 xl:block">
          {t("title")}
        </span>

        {SLIDERS.map((s) => (
          <label key={s.key} className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-[0.68rem] text-champagne/80">{t(s.key)}</span>
            <input
              type="range"
              className="range w-24 sm:w-28"
              min={s.min}
              max={s.max}
              step={s.step}
              value={params[s.key]}
              aria-label={t(s.key)}
              onChange={(e) => setSceneParam(s.key, Number(e.target.value))}
            />
            <span className="num w-9 font-en text-[0.65rem] text-gold/80">
              {params[s.key].toFixed(2)}
            </span>
          </label>
        ))}

        <label className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-[0.68rem] text-champagne/80">{t("density")}</span>
          <select
            className="rounded-md border border-champagne/20 bg-surface px-2 py-1 text-[0.7rem] text-ivory outline-none focus:border-gold/60"
            value={params.density}
            aria-label={t("density")}
            onChange={(e) => setSceneParam("density", Number(e.target.value) as 0 | 1 | 2)}
          >
            {([0, 1, 2] as const).map((d) => (
              <option key={d} value={d}>
                {t(`density${d}`)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-pressed={params.spin}
          onClick={() => setSceneParam("spin", !params.spin)}
          className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] transition-colors ${
            params.spin
              ? "border-gold/60 bg-gold/15 text-gold"
              : "border-champagne/20 text-champagne/70 hover:border-champagne/40"
          }`}
        >
          {t("spin")}
        </button>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <button type="button" onClick={resetSceneParams} className={ACTION_BTN}>
            {t("reset")}
          </button>
          <button type="button" onClick={randomizeSceneParams} className={ACTION_BTN}>
            {t("randomize")}
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("fuo:snapshot"))}
            className="shrink-0 rounded-full border border-gold/50 px-3 py-1 text-[0.68rem] font-bold text-gold transition-colors hover:bg-gold/15"
          >
            {t("export")}
          </button>
        </div>
      </div>
    </div>
  );
}