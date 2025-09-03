// AEST date utilities with embedded self-tests (throws on failure)
const AEST_TZ = 'Australia/Sydney';

export function toDate(v: string | Date): Date {
  if (v instanceof Date) return new Date(v.getTime());
  return new Date(v);
}

export function startOfDayAEST(d: Date): Date {
  // Use formatToParts to extract Y/M/D in AEST then construct UTC date approximating local midnight AEST
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: AEST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  let y = 1970;
  let m = 1;
  let day = 1;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.type === 'year') y = parseInt(p.value, 10);
    if (p.type === 'month') m = parseInt(p.value, 10);
    if (p.type === 'day') day = parseInt(p.value, 10);
  }
  // Midnight AEST = 14:00 UTC (standard) but DST complicates; we only need consistency (same function everywhere)
  return new Date(Date.UTC(y, m - 1, day, 14, 0, 0, 0));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

export function startOfWeekAEST(d: Date): Date {
  const sod = startOfDayAEST(d);
  const dow = sod.getUTCDay(); // Sunday=0
  const diff = dow === 0 ? -6 : 1 - dow; // Monday start
  return addDays(sod, diff);
}

export function nightsBetween(start: Date, end: Date): number {
  const s = startOfDayAEST(start).getTime();
  const e = startOfDayAEST(end).getTime();
  if (e <= s) return 0;
  return Math.round((e - s) / 86400000);
}

export function todayAEST(): Date {
  return startOfDayAEST(new Date());
}

(function selfTests() {
  function assert(name: string, cond: boolean) {
    if (!cond) throw new Error('date self-test failed: ' + name);
  }
  const test = new Date('2024-06-05T12:00:00+10:00');
  const w = startOfWeekAEST(test);
  // Monday has UTC weekday 1
  assert('week starts Monday', w.getUTCDay() === 1);
  assert('nightsBetween 4', nightsBetween(new Date('2024-06-01T00:00:00+10:00'), new Date('2024-06-05T00:00:00+10:00')) === 4);
})();
