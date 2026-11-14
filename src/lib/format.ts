export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", options).format(
    value,
  );
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(
    locale === "fa" ? "fa-IR-u-ca-persian" : "en-US",
    { dateStyle: "long" },
  ).format(new Date(iso));
}

export function toPersianDigits(input: string) {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return input.replace(/\d/g, (d) => fa[Number(d)]);
}