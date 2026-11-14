import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate, formatNumber } from "@/lib/format";
import fa from "../../../../../messages/fa.json";

type NewsItem = {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  body: string[];
};

type Props = { params: Promise<{ locale: string; slug: string }> };

const CATEGORY_HUES: Record<string, string> = {
  tech: "#38d6e0",
  peace: "#86c66b",
  development: "#3ed598",
  org: "#5b8cff",
};

export function generateStaticParams() {
  return fa.news.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  const item = (t.raw("items") as NewsItem[]).find((i) => i.slug === slug);
  if (!item) return {};
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/${locale}/news/${slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: "article",
      publishedTime: item.date,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const brand = await getTranslations("brand");
  const items = t.raw("items") as NewsItem[];
  const index = items.findIndex((i) => i.slug === slug);
  if (index === -1) notFound();
  const item = items[index];
  const next = items[(index + 1) % items.length];
  const hue = CATEGORY_HUES[item.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    datePublished: item.date,
    inLanguage: locale,
    author: { "@type": "Organization", name: brand("name") },
    publisher: { "@type": "Organization", name: brand("name") },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="relative overflow-hidden">
        <div className="aurora absolute inset-0 opacity-50" aria-hidden="true" />
        <header className="shell relative pb-10 pt-[calc(var(--nav-h)+3.5rem)]">
          <Reveal>
            <Link href="/news" className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-gold">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              {t("backToList")}
            </Link>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span
                className="rounded-full border px-3 py-1 text-[0.65rem]"
                style={{ color: hue, borderColor: `${hue}55` }}
              >
                {t(`categories.${item.category}`)}
              </span>
              <time dateTime={item.date} className="num text-xs text-muted">
                {formatDate(item.date, locale)}
              </time>
              <span className="num text-xs text-muted">
                {formatNumber(item.readMinutes, locale)} {t("minRead")}
              </span>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="h1 mt-5 max-w-3xl text-ivory">{item.title}</h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="lead mt-5 max-w-2xl text-muted">{item.excerpt}</p>
          </Reveal>
        </header>

        <div className="shell relative pb-16">
          <div className="hairline mb-10" aria-hidden="true" />
          <div className="max-w-3xl space-y-7">
            {item.body.map((paragraph, i) => (
              <Reveal key={i} delay={Math.min(i, 2) * 80}>
                <p className="text-base leading-9 text-champagne/85">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16">
            <Link href={`/news/${next.slug}`} className="card group block !rounded-2xl p-7">
              <p className="eyebrow">{t("readMore")}</p>
              <p className="mt-3 text-lg font-bold text-ivory transition-colors group-hover:text-gold">
                {next.title}
              </p>
            </Link>
          </Reveal>
        </div>
      </article>
    </>
  );
}