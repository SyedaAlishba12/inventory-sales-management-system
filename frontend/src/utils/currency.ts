export function formatCurrency(
  value: number,
  currency = "PKR",
  locale = "en-PK",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function parseCurrency(value: string) {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}
