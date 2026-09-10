const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{6,19}$/;
const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,49}$/;

export function isRequired(value: unknown) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string) {
  return PHONE_PATTERN.test(value.trim());
}

export function isValidSku(value: string) {
  return SKU_PATTERN.test(value.trim());
}

export function isPositiveNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0;
}

export function isNonNegativeNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0;
}
