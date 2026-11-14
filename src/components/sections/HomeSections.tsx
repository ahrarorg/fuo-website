import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { StatCounter } from "@/components/ui/StatCounter";
import { formatDate } from "@/lib/format";

type Stat = { value: number; suffix: string; label: string; note: string };
type NewsItem = {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  body: string[];
};

const CATEGORY_HUES: Record<string, string> = {
  tech: "#38d6e0",
  peace: "#86c66b",
  development: "#3ed598",
  org: "#5b8cff",
};

export async function MissionStrip() {
  const t = await getTranslations("home");
  return (
    <section className="manuscript relative">
      <div className="arc-divider" aria-hidden="true" />
      <div className="shell section-pad text-center">
        <Reveal>
          <p className="eyebrow !text-gold-deep">{t("missionTitle")}</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="h2 mx-auto mt-6 max-w-3xl !leading-[1.7] text-ink">{t("missionText")}</p>
        </Reveal>
        <Reveal delay={220}>
          <Link href="/mission" className="btn-ghost mt-9 !border-ink/25 !text-ink hover:!border-gold-deep hover:!text-gold-deep">
            {t("missionCta")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export async function ImpactPreview() {
  const t = await getTranslations("home");
  const impact = await getTranslations("impact");
  const stats = impact.raw("stats") as Stat[];
  return (
    <section className="relative overflow-hidden">
      <div className="aurora absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="shell section-pad relative">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{t("impactTitle")}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{t("impactLead")}</p>
          </div>
          <Link href="/impact" className="btn-ghost">
            {t("impactCta")}
          </Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100} className="card !rounded-2xl p-6 text-center">
              <p className="h2 text-gold">
                <StatCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-bold text-ivory">{s.label}</p>
              <p className="mt-1 text-xs text-muted">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function NewsPreview() {
  const t = await getTranslations("home");
  const news = await getTranslations("news");
  const locale = await getLocale();
  const items = (news.raw("items") as NewsItem[]).slice(0, 3);
  return (
    <section className="border-t border-champagne/8 bg-charcoal/40">
      <div className="shell section-pad">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="h2 text-ivory">{t("newsTitle")}</h2>
          <Link href="/news" className="btn-ghost">
            {t("newsCta")}
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.slug} delay={i * 110} as="article">
              <Link
                href={`/news/${item.slug}`}
                className="card group flex h-full flex-col !rounded-2xl p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full border px-3 py-1 text-[0.65rem]"
                    style={{
                      color: CATEGORY_HUES[item.category],
                      borderColor: `${CATEGORY_HUES[item.category]}55`,
                    }}
                  >
                    {news(`categories.${item.category}`)}
                  </span>
                  <time dateTime={item.date} className="num text-xs text-muted">
                    {formatDate(item.date, locale)}
                  </time>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-8 text-ivory transition-colors group-hover:text-gold">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted">{item.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs text-gold/80">
                  {news("readMore")}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function JoinBand() {
  const t = await getTranslations("home");
  return (
    <section className="relative overflow-hidden border-t border-gold/15">
      <div className="aurora absolute inset-0" aria-hidden="true" />
      <div className="shell section-pad relative text-center">
        <Reveal>
          <h2 className="h1 text-ivory">{t("joinTitle")}</h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="lead mx-auto mt-5 max-w-2xl text-muted">{t("joinText")}</p>
        </Reveal>
        <Reveal delay={220}>
          <Magnetic className="mt-9 inline-block">
            <Link href="/join" className="btn-gold !px-9 !py-4 text-base">
              {t("joinCta")}
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}