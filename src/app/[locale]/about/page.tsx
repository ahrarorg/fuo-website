import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/motion/Reveal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/about` } };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const brand = await getTranslations("brand");
  const story = t.raw("story") as string[];
  const timeline = t.raw("timeline") as { year: string; title: string; text: string }[];
  const governance = t.raw("governance") as { title: string; text: string }[];

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />

      <section className="manuscript relative">
        <div className="shell section-pad">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <h2 className="h2 sticky top-[calc(var(--nav-h)+2rem)] text-ink">{t("storyTitle")}</h2>
            </Reveal>
            <div className="space-y-7">
              {story.map((p, i) => (
                <Reveal key={i} delay={i * 100}>
                  <p className="text-base leading-9 text-ink/85">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="shell section-pad">
          <Reveal>
            <h2 className="h2 text-ivory">{t("timelineTitle")}</h2>
          </Reveal>
          <ol className="relative mt-12 space-y-10 border-s border-gold/25 ps-8">
            {timeline.map((item, i) => (
              <Reveal as="li" key={item.year} delay={i * 90} className="relative">
                <span
                  className="absolute -start-[2.45rem] top-1 grid size-5 place-items-center rounded-full border border-gold/60 bg-obsidian"
                  aria-hidden="true"
                >
                  <span className="size-1.5 rounded-full bg-gold" />
                </span>
                <p className="num text-sm font-bold text-gold">{item.year}</p>
                <h3 className="mt-1 text-lg font-bold text-ivory">{item.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-champagne/8 bg-charcoal/40">
        <div className="shell section-pad">
          <Reveal>
            <h2 className="h2 text-ivory">{t("governanceTitle")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {governance.map((g, i) => (
              <Reveal key={g.title} delay={i * 90} className="card !rounded-2xl p-7">
                <p className="num text-xs text-gold/70">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-bold text-ivory">{g.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{g.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}