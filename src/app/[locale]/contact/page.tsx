import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"), description: t("lead"), alternates: { canonical: `/${locale}/contact` } };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const brand = await getTranslations("brand");

  const channels = [
    { label: t("emailLabel"), value: t("emailValue"), ltr: true },
    { label: t("responseLabel"), value: t("responseValue"), ltr: false },
    { label: t("networkLabel"), value: t("networkValue"), ltr: false },
  ];

  return (
    <>
      <PageHeader eyebrow={brand("name")} title={t("title")} lead={t("lead")} />
      <div className="shell section-pad grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <div>
          <Reveal delay={100}>
            <h2 className="h3 text-ivory">{t("infoTitle")}</h2>
          </Reveal>
          <div className="mt-6 space-y-4">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={160 + i * 90} className="card !rounded-xl p-5">
                <p className="eyebrow">{c.label}</p>
                {c.ltr ? (
                  <a href={`mailto:${c.value}`} dir="ltr" className="mt-2 block font-en text-base text-gold hover:text-gold-hot transition-colors">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-2 text-base text-champagne/90">{c.value}</p>
                )}
              </Reveal>
            ))}
          </div>
          <Reveal delay={420}>
            <p className="mt-6 text-xs leading-6 text-muted/70">{t("note")}</p>
          </Reveal>
        </div>
      </div>
    </>
  );
}