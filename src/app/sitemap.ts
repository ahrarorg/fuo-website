import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import fa from "../../messages/fa.json";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PATHS = ["", "/about", "/mission", "/programs", "/news", "/impact", "/contact", "/join"];

export default function sitemap(): MetadataRoute.Sitemap {
  const articlePaths = fa.news.items.map((i) => `/news/${i.slug}`);
  return [...PATHS, ...articlePaths].map((path) => ({
    url: `${BASE}/fa${path}`,
    changeFrequency: path.startsWith("/news") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/news/") ? 0.6 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${BASE}/${locale}${path}`]),
      ),
    },
  }));
}