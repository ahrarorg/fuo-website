"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS, type DepartmentSlug } from "@/lib/departments";
import { DeptGlyph } from "@/components/ui/DeptGlyph";
import { formatNumber } from "@/lib/format";

type Tier = {
  id: string;
  name: string;
  amount: number;
  period: string;
  outcome: string;
  features: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PRESETS = [9, 29, 99, 250];

function SuccessPanel({ title, text, note }: { title: string; text: string; note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card !rounded-2xl p-10 text-center"
      role="status"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full border border-success/50 text-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      </span>
      <h3 className="mt-5 text-xl font-bold text-ivory">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">{text}</p>
      <p className="mt-5 text-xs text-muted/70">{note}</p>
    </motion.div>
  );
}

export function JoinFlow() {
  const t = useTranslations("join");
  const depts = useTranslations("departments");
  const locale = useLocale();
  const params = useSearchParams();
  const tiers = t.raw("tiers") as Tier[];

  const queryOrbit = params.get("orbit");
  const [tab, setTab] = useState<"membership" | "support">("membership");
  const [orbit, setOrbit] = useState<DepartmentSlug>(
    DEPARTMENT_SLUGS.includes(queryOrbit as DepartmentSlug) ? (queryOrbit as DepartmentSlug) : "talent",
  );
  const [tierId, setTierId] = useState("member");
  const tier = tiers.find((x) => x.id === tierId) ?? tiers[0];

  const [form, setForm] = useState({ name: "", email: "", city: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [mState, setMState] = useState<"idle" | "submitting" | "success">("idle");

  const [freq, setFreq] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState(29);
  const [custom, setCustom] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [sErrors, setSErrors] = useState<{ amount?: string; email?: string }>({});
  const [sState, setSState] = useState<"idle" | "submitting" | "success">("idle");

  const effectiveAmount = custom.trim() !== "" ? Number(custom) : amount;
  const matchedTier = [...tiers].reverse().find((x) => effectiveAmount >= x.amount);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submitMembership = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string | undefined> = {};
    if (!form.name.trim()) next.name = t("form.errorRequired");
    if (!form.email.trim()) next.email = t("form.errorRequired");
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t("form.errorEmail");
    if (!form.city.trim()) next.city = t("form.errorRequired");
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setMState("submitting");
    window.setTimeout(() => {
      localStorage.setItem(
        "fuo-membership",
        JSON.stringify({ ...form, orbit, tier: tierId, at: new Date().toISOString() }),
      );
      setMState("success");
    }, 800);
  };

  const submitSupport = (e: FormEvent) => {
    e.preventDefault();
    const next: { amount?: string; email?: string } = {};
    if (!Number.isFinite(effectiveAmount) || effectiveAmount <= 0) next.amount = t("form.errorRequired");
    if (!supportEmail.trim()) next.email = t("form.errorRequired");
    else if (!EMAIL_RE.test(supportEmail.trim())) next.email = t("form.errorEmail");
    setSErrors(next);
    if (next.amount || next.email) return;
    setSState("submitting");
    window.setTimeout(() => {
      localStorage.setItem(
        "fuo-support",
        JSON.stringify({ amount: effectiveAmount, freq, email: supportEmail, at: new Date().toISOString() }),
      );
      setSState("success");
    }, 800);
  };

  const inputClass = (invalid?: string) =>
    `w-full rounded-xl border bg-obsidian/60 px-4 py-3 text-sm text-ivory placeholder:text-muted/50 transition-colors focus:outline-none ${
      invalid ? "border-danger/60" : "border-champagne/15 focus:border-gold/60"
    }`;

  return (
    <div className="shell section-pad">
      <div className="mx-auto flex max-w-md gap-2 rounded-full border border-champagne/12 bg-obsidian/60 p-1.5" role="group" aria-label={t("title")}>
        {(["membership", "support"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`flex-1 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              tab === key ? "bg-gold text-ink" : "text-champagne/70 hover:text-ivory"
            }`}
          >
            {key === "membership" ? t("tabMembership") : t("tabSupport")}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "membership" ? (
          <motion.div
            key="membership"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            {mState === "success" ? (
              <SuccessPanel
                title={t("form.successTitle")}
                text={t("form.successText", { orbit: depts(`items.${orbit}.name`) })}
                note={t("demoNote")}
              />
            ) : (
              <>
                <h2 className="h3 text-ivory">{t("pickerTitle")}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{t("pickerLead")}</p>
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {DEPARTMENT_SLUGS.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setOrbit(slug)}
                      aria-pressed={orbit === slug}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all duration-300 ${
                        orbit === slug
                          ? "border-gold/60 bg-surface"
                          : "border-champagne/10 bg-obsidian/40 hover:border-champagne/30"
                      }`}
                    >
                      <span style={{ color: DEPARTMENT_HUES[slug] }}>
                        <DeptGlyph slug={slug} size={24} />
                      </span>
                      <span className={`text-xs leading-5 ${orbit === slug ? "text-gold" : "text-champagne/80"}`}>
                        {depts(`items.${slug}.short`)}
                      </span>
                    </button>
                  ))}
                </div>

                <h2 className="h3 mt-14 text-ivory">{t("tiersTitle")}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {tiers.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setTierId(x.id)}
                      aria-pressed={tierId === x.id}
                      className={`card flex flex-col !rounded-2xl p-6 text-start transition-all duration-300 ${
                        tierId === x.id ? "!border-gold/60 !bg-surface" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-bold ${tierId === x.id ? "text-gold" : "text-ivory"}`}>
                          {x.name}
                        </span>
                        <span
                          className={`grid size-5 place-items-center rounded-full border transition-colors ${
                            tierId === x.id ? "border-gold bg-gold" : "border-champagne/30"
                          }`}
                          aria-hidden="true"
                        >
                          {tierId === x.id && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#14100a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12.5l5 5L20 6.5" />
                            </svg>
                          )}
                        </span>
                      </div>
                      <p className="mt-4 flex items-baseline gap-1" dir="ltr">
                        <span className="num text-3xl font-bold text-ivory">${formatNumber(x.amount, locale)}</span>
                        <span className="text-xs text-muted">{x.period}</span>
                      </p>
                      <p className="mt-3 text-xs leading-6 text-gold/85">{x.outcome}</p>
                      <ul className="mt-4 space-y-2 border-t border-champagne/10 pt-4">
                        {x.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs leading-6 text-muted">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-gold/70" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <form onSubmit={submitMembership} noValidate className="card mt-10 !rounded-2xl p-7 sm:p-9">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    {t("form.selectedOrbit")}:
                    <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/8 px-3 py-1 text-xs text-gold">
                      <span style={{ color: DEPARTMENT_HUES[orbit] }}>
                        <DeptGlyph slug={orbit} size={14} />
                      </span>
                      {depts(`items.${orbit}.name`)}
                    </span>
                    <span className="text-xs text-champagne/70">
                      {tier.name} · <span dir="ltr">${formatNumber(tier.amount, locale)}</span>
                      {tier.period}
                    </span>
                  </p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="join-name" className="mb-2 block text-sm text-champagne/85">{t("form.name")}</label>
                      <input id="join-name" value={form.name} onChange={setField("name")} placeholder={t("form.namePh")} aria-invalid={!!errors.name} className={inputClass(errors.name)} />
                      {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="join-email" className="mb-2 block text-sm text-champagne/85">{t("form.email")}</label>
                      <input id="join-email" type="email" dir="ltr" value={form.email} onChange={setField("email")} placeholder={t("form.emailPh")} aria-invalid={!!errors.email} className={inputClass(errors.email)} />
                      {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="mt-5">
                    <label htmlFor="join-city" className="mb-2 block text-sm text-champagne/85">{t("form.city")}</label>
                    <input id="join-city" value={form.city} onChange={setField("city")} placeholder={t("form.cityPh")} aria-invalid={!!errors.city} className={inputClass(errors.city)} />
                    {errors.city && <p className="mt-1.5 text-xs text-danger">{errors.city}</p>}
                  </div>
                  <div className="mt-5">
                    <label htmlFor="join-message" className="mb-2 block text-sm text-champagne/85">{t("form.message")}</label>
                    <textarea id="join-message" rows={3} value={form.message} onChange={setField("message")} placeholder={t("form.messagePh")} className={inputClass()} />
                  </div>
                  <button type="submit" disabled={mState === "submitting"} className="btn-gold mt-7 disabled:opacity-60">
                    {mState === "submitting" ? t("form.submitting") : t("form.submit")}
                  </button>
                  <p className="mt-4 text-xs text-muted/70">{t("demoNote")}</p>
                </form>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="support"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            {sState === "success" ? (
              <SuccessPanel title={t("support.successTitle")} text={t("support.successText")} note={t("support.note")} />
            ) : (
              <div className="mx-auto max-w-2xl">
                <h2 className="h3 text-center text-ivory">{t("support.title")}</h2>
                <p className="mt-3 text-center text-sm leading-7 text-muted">{t("support.lead")}</p>

                <form onSubmit={submitSupport} noValidate className="card mt-8 !rounded-2xl p-7 sm:p-9">
                  <div className="flex gap-2 rounded-full border border-champagne/12 bg-obsidian/60 p-1" role="group" aria-label={t("support.title")}>
                    {(["once", "monthly"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFreq(key)}
                        aria-pressed={freq === key}
                        className={`flex-1 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                          freq === key ? "bg-gold text-ink" : "text-champagne/70 hover:text-ivory"
                        }`}
                      >
                        {t(`support.${key}`)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(preset);
                          setCustom("");
                          setSErrors((er) => ({ ...er, amount: undefined }));
                        }}
                        aria-pressed={custom === "" && amount === preset}
                        className={`rounded-xl border py-3 text-sm font-bold transition-all duration-300 ${
                          custom === "" && amount === preset
                            ? "border-gold/60 bg-gold/10 text-gold"
                            : "border-champagne/12 text-champagne/75 hover:border-champagne/30"
                        }`}
                      >
                        <span dir="ltr" className="num">${formatNumber(preset, locale)}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="support-custom" className="mb-2 block text-sm text-champagne/85">{t("support.custom")}</label>
                    <input
                      id="support-custom"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      dir="ltr"
                      value={custom}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        setSErrors((er) => ({ ...er, amount: undefined }));
                      }}
                      placeholder={t("support.customPh")}
                      aria-invalid={!!sErrors.amount}
                      className={inputClass(sErrors.amount)}
                    />
                    {sErrors.amount && <p className="mt-1.5 text-xs text-danger">{sErrors.amount}</p>}
                  </div>

                  <div className="mt-5">
                    <label htmlFor="support-email" className="mb-2 block text-sm text-champagne/85">{t("form.email")}</label>
                    <input
                      id="support-email"
                      type="email"
                      dir="ltr"
                      value={supportEmail}
                      onChange={(e) => {
                        setSupportEmail(e.target.value);
                        setSErrors((er) => ({ ...er, email: undefined }));
                      }}
                      placeholder={t("form.emailPh")}
                      aria-invalid={!!sErrors.email}
                      className={inputClass(sErrors.email)}
                    />
                    {sErrors.email && <p className="mt-1.5 text-xs text-danger">{sErrors.email}</p>}
                  </div>

                  {matchedTier && Number.isFinite(effectiveAmount) && effectiveAmount > 0 && (
                    <p className="mt-6 rounded-xl border border-gold/25 bg-gold/6 px-4 py-3 text-xs leading-6 text-gold/90">
                      {t("support.outcomePrefix")} {matchedTier.outcome}
                      {freq === "monthly" && ` (${t("support.perMonth")})`}
                    </p>
                  )}

                  <button type="submit" disabled={sState === "submitting"} className="btn-gold mt-7 w-full justify-center disabled:opacity-60">
                    {sState === "submitting"
                      ? t("form.submitting")
                      : `${t("support.submit")} · `}
                    {sState !== "submitting" && (
                      <span dir="ltr" className="num">
                        ${formatNumber(Number.isFinite(effectiveAmount) ? effectiveAmount : 0, locale)}
                      </span>
                    )}
                  </button>
                  <p className="mt-4 text-center text-xs text-muted/70">{t("support.note")}</p>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}