export function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : "";
}

export function humanize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

export function truncate(value: string, maximumLength = 80) {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

export function getInitials(name: string, maximumParts = 2) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maximumParts)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function formatNumber(value: number, locale = "en-PK") {
  return new Intl.NumberFormat(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, locale = "en-PK") {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value);
}
