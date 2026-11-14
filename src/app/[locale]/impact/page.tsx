import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { OrbitChart, ReportDownload } from "@/components/sections/ImpactCharts";
import { formatNumber } from "@/lib/format";

type Props = { params: Promise<{ locale: string }> };

const ALLOCATION_COLORS = ["#e8b84b", "#38d6e0", "#a79e8b"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "impact" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/impact` } };
}

export default async function ImpactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("impact");
  const brand = await getTranslations("brand");
  const common = await getTranslations("common");
  const stats = t.raw("stats") as { value: number; suffix: string; label: string; note: string }[];
  const values = t.raw("chartValues") as number[];
  const allocation = t.raw("allocation") as { label: string; percent: number }[];

  const C = 2 * Math.PI * 70;
  let offset = 0;

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />

      <section className="relative">
        <div className="shell section-pad">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} className="card !rounded-2xl p-6 text-center">
                <p className="h1 text-gold">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-bold text-ivory">{s.label}</p>
                <p className="mt-1 text-xs text-muted">{s.note}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/8 px-4 py-1.5 text-xs text-warning">
              <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
              {t("disclaimer")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-champagne/8 bg-charcoal/40">
        <div className="shell section-pad">
          <Reveal>
            <h2 className="h2 text-ivory">{t("chartTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{t("chartLead")}</p>
          </Reveal>
          <Reveal delay={120}>
            <OrbitChart values={values} />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="aurora absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="shell section-pad relative">
          <Reveal>
            <h2 className="h2 text-ivory">{t("allocationTitle")}</h2>
          </Reveal>
          <div className="mt-10 grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <Reveal className="mx-auto">
              <svg width="220" height="220" viewBox="0 0 200 200" role="img" aria-label={allocation.map((a) => `${a.label}: ${a.percent}%`).join(", ")}>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#1e1a14" strokeWidth="22" />
                {allocation.map((a, i) => {
                  const dash = (a.percent / 100) * C;
                  const el = (
                    <circle
                      key={a.label}
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke={ALLOCATION_COLORS[i]}
                      strokeWidth="22"
                      strokeDasharray={`${dash - 2} ${C - dash + 2}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 100 100)"
                      strokeLinecap="butt"
                    />
                  );
                  offset += dash;
                  return el;
                })}
                <text x="100" y="94" textAnchor="middle" fill="#f6f0e1" fontSize="26" fontWeight="700">
                  {formatNumber(72, locale)}%
                </text>
                <text x="100" y="116" textAnchor="middle" fill="#a79e8b" fontSize="10">
                  {allocation[0].label}
                </text>
              </svg>
            </Reveal>
            <div className="space-y-5">
              {allocation.map((a, i) => (
                <Reveal key={a.label} delay={i * 100}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-sm text-champagne/85">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[i] }} aria-hidden="true" />
                      {a.label}
                    </span>
                    <span className="num text-lg font-bold" style={{ color: ALLOCATION_COLORS[i] }}>
                      {formatNumber(a.percent, locale)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full" style={{ width: `${a.percent}%`, backgroundColor: ALLOCATION_COLORS[i] }} />
                  </div>
                </Reveal>
              ))}
              <Reveal delay={320}>
                <p className="pt-1 text-xs text-muted">{t("allocationNote")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gold/15 bg-charcoal/60">
        <div className="shell section-pad flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Reveal>
            <h2 className="h3 text-ivory">{t("reportTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{t("reportText")}</p>
            <p className="mt-2 text-xs text-muted/70">{common("sampleBadge")}: {t("disclaimer")}</p>
          </Reveal>
          <Reveal delay={120}>
            <ReportDownload />
          </Reveal>
        </div>
      </section>
    </>
  );
}