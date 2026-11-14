import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { routing, type Locale } from "@/i18n/routing";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Loader } from "@/components/motion/Loader";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { getYear } from "@/lib/year";
import "../globals.css";

const vazir = localFont({
  src: "../../../node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2",
  variable: "--font-vazir",
  weight: "100 900",
  display: "swap",
});

const space = localFont({
  src: "../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space",
  weight: "300 700",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const brand = await getTranslations({ locale, namespace: "brand" });
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

  return {
    metadataBase: base,
    title: {
      default: t("title"),
      template: `%s | ${brand("short")}`,
    },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { fa: "/fa", en: "/en", "x-default": "/fa" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: brand("name"),
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
      url: `/${locale}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/opengraph-image"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const brand = await getTranslations({ locale, namespace: "brand" });
  const year = await getYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand("name"),
    alternateName: "سازمان جهانشمول احرار",
    slogan: brand("tagline"),
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 3600 },
  };

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={`${vazir.variable} ${space.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2 focus:font-bold focus:text-ink"
            >
              {nav("skip")}
            </a>
            <Loader />
            <CustomCursor />
            <ScrollProgress />
            <Nav />
            <main id="main">{children}</main>
            <Footer year={year} />
            <div className="grain" aria-hidden="true" />
          </MotionProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}