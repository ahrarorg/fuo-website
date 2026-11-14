import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { ProgramsChips, ProgramsRail } from "@/components/sections/ProgramsNav";
import { Reveal } from "@/components/motion/Reveal";
import { DeptGlyph } from "@/components/ui/DeptGlyph";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";
import { formatNumber } from "@/lib/format";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "departments" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/programs` } };
}

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("departments");
  const brand = await getTranslations("brand");

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />
      <ProgramsChips />

      <div className="shell-wide section-pad grid gap-12 lg:grid-cols-[250px_1fr]">
        <ProgramsRail />

        <div className="space-y-20">
          {DEPARTMENT_SLUGS.map((slug, i) => {
            const hue = DEPARTMENT_HUES[slug];
            const activities = t.raw(`items.${slug}.activities`) as string[];
            return (
              <section
                key={slug}
                id={slug}
                aria-labelledby={`${slug}-title`}
                className="relative border-s-2 ps-6 sm:ps-10"
                style={{
                  borderColor: `${hue}66`,
                  background: `radial-gradient(ellipse 70% 45% at 0% 0%, ${hue}0e, transparent 70%)`,
                }}
              >
                <Reveal>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="num text-sm" style={{ color: hue }}>
                      {formatNumber(i + 1, locale, { minimumIntegerDigits: 2 })}
                    </span>
                    <span style={{ color: hue }}>
                      <DeptGlyph slug={slug} size={30} />
                    </span>
                    <h2 id={`${slug}-title`} className="h3 text-ivory">
                      {t(`items.${slug}.name`)}
                    </h2>
                  </div>
                </Reveal>
                <Reveal delay={90}>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
                    {t(`items.${slug}.description`)}
                  </p>
                </Reveal>
                <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                  {activities.map((activity, j) => (
                    <Reveal as="li" key={j} delay={140 + j * 80} className="card !rounded-xl p-4">
                      <span className="mb-3 block h-0.5 w-8 rounded-full" style={{ backgroundColor: hue }} aria-hidden="true" />
                      <span className="text-sm leading-7 text-champagne/85">{activity}</span>
                    </Reveal>
                  ))}
                </ul>
                <Reveal delay={200}>
                  <Link href={`/join?orbit=${slug}`} className="btn-ghost mt-7">
                    {t("joinCta")}
                  </Link>
                </Reveal>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}