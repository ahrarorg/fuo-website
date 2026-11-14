import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { HomeHero } from "@/components/sections/HomeHero";
import {
  ImpactPreview,
  JoinBand,
  MissionStrip,
  NewsPreview,
} from "@/components/sections/HomeSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { absolute: t("title") },
    description: t("description"),
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <MissionStrip />
      <ImpactPreview />
      <NewsPreview />
      <JoinBand />
    </>
  );
}