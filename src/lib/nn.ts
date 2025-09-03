export function nn<T>(v: T | undefined | null, fallback: T): T {
  if (v === undefined || v === null) return fallback;
  return v;
}