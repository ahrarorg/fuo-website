import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { ValuePillars } from "@/components/sections/ValuePillars";
import { Reveal } from "@/components/motion/Reveal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mission" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/mission` } };
}

export default async function MissionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mission");
  const brand = await getTranslations("brand");
  const how = t.raw("how") as { title: string; text: string }[];

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />

      <section className="manuscript relative">
        <div className="shell section-pad text-center">
          <Reveal>
            <p className="eyebrow !text-gold-deep">{t("statementTitle")}</p>
          </Reveal>
          <Reveal delay={120}>
            <p className="h2 mx-auto mt-6 max-w-3xl !leading-[1.8] text-ink">{t("statement")}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="shell section-pad">
          <Reveal>
            <h2 className="h2 text-ivory">{t("valuesTitle")}</h2>
          </Reveal>
          <Reveal delay={120}>
            <ValuePillars />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-champagne/8 bg-charcoal/40">
        <div className="shell section-pad">
          <Reveal>
            <h2 className="h2 text-ivory">{t("howTitle")}</h2>
          </Reveal>
          <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
            <div className="absolute inset-x-0 top-6 hidden h-px bg-linear-to-r from-transparent via-gold/40 to-transparent md:block" aria-hidden="true" />
            {how.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="relative text-center md:px-4">
                <span className="relative z-10 mx-auto grid size-12 place-items-center rounded-full border border-gold/50 bg-obsidian text-gold">
                  <span className="num text-sm font-bold">{i + 1}</span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-ivory">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}