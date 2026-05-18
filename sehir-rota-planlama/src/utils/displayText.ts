export function toDisplayText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object" && value !== null && "name" in value) {
    const named = (value as { name?: unknown }).name;
    if (typeof named === "string" && named.trim()) return named.trim();
    if (typeof named === "number" && Number.isFinite(named)) return String(named);
  }
  return fallback;
}

export function toDisplayNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function formatRating(value: unknown, decimals = 1, fallback = 4.0): string {
  const rating = toDisplayNumber(value, fallback);
  return rating.toFixed(decimals);
}

export function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
