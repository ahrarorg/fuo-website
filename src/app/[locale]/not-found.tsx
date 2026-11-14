import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AoMark } from "@/components/ui/AoMark";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "404",
  robots: { index: false },
};

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="aurora absolute inset-0" aria-hidden="true" />
      <AoMark size={80} className="relative text-gold/70" />
      <p className="eyebrow relative mt-8">404</p>
      <h1 className="h1 relative mt-4 text-ivory">{t("title")}</h1>
      <p className="lead relative mt-4 max-w-md text-muted">{t("text")}</p>
      <Link href="/" className="btn-gold relative mt-9">
        {t("cta")}
      </Link>
    </div>
  );
}