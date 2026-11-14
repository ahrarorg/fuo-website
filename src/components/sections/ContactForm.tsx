"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = t("form.errorRequired");
    if (!values.email.trim()) next.email = t("form.errorRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = t("form.errorEmail");
    if (!values.subject.trim()) next.subject = t("form.errorRequired");
    if (!values.message.trim()) next.message = t("form.errorRequired");
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("submitting");
    window.setTimeout(() => {
      localStorage.setItem("fuo-contact", JSON.stringify({ ...values, at: new Date().toISOString() }));
      setState("success");
    }, 700);
  };

  if (state === "success") {
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
        <h3 className="mt-5 text-xl font-bold text-ivory">{t("form.successTitle")}</h3>
        <p className="mt-3 text-sm leading-7 text-muted">{t("form.successText")}</p>
        <p className="mt-5 text-xs text-muted/70">{t("form.demoNote")}</p>
      </motion.div>
    );
  }

  const field = (
    key: keyof typeof values,
    label: string,
    placeholder: string,
    type = "text",
    textarea = false,
  ) => (
    <div>
      <label htmlFor={`contact-${key}`} className="mb-2 block text-sm text-champagne/85">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={`contact-${key}`}
          rows={5}
          value={values[key]}
          onChange={set(key)}
          placeholder={placeholder}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `contact-${key}-err` : undefined}
          className={`w-full rounded-xl border bg-obsidian/60 px-4 py-3 text-sm text-ivory placeholder:text-muted/50 transition-colors focus:outline-none ${
            errors[key] ? "border-danger/60" : "border-champagne/15 focus:border-gold/60"
          }`}
        />
      ) : (
        <input
          id={`contact-${key}`}
          type={type}
          dir={type === "email" ? "ltr" : undefined}
          value={values[key]}
          onChange={set(key)}
          placeholder={placeholder}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `contact-${key}-err` : undefined}
          className={`w-full rounded-xl border bg-obsidian/60 px-4 py-3 text-sm text-ivory placeholder:text-muted/50 transition-colors focus:outline-none ${
            errors[key] ? "border-danger/60" : "border-champagne/15 focus:border-gold/60"
          }`}
        />
      )}
      {errors[key] && (
        <p id={`contact-${key}-err`} className="mt-1.5 text-xs text-danger">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="card !rounded-2xl p-7 sm:p-9">
      <h2 className="h3 text-ivory">{t("formTitle")}</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {field("name", t("form.name"), t("form.namePh"))}
        {field("email", t("form.email"), t("form.emailPh"), "email")}
      </div>
      <div className="mt-5">{field("subject", t("form.subject"), t("form.subjectPh"))}</div>
      <div className="mt-5">{field("message", t("form.message"), t("form.messagePh"), "text", true)}</div>
      <button type="submit" disabled={state === "submitting"} className="btn-gold mt-7 disabled:opacity-60">
        {state === "submitting" ? t("form.submitting") : t("form.submit")}
      </button>
      <p className="mt-4 text-xs text-muted/70">{t("form.demoNote")}</p>
    </form>
  );
}