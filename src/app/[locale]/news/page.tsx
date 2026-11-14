import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { NewsIndex } from "@/components/sections/NewsIndex";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/news` } };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const brand = await getTranslations("brand");

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />
      <NewsIndex />
    </>
  );
}