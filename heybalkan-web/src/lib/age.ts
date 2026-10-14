export const MIN_AGE = 18;

// "TT.MM.JJJJ" -> "JJJJ-MM-TT", nur wenn es das Datum wirklich gibt (kein 31.02.)
export function parseBirthDate(input: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    year < 1900
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export function getAgeFromIso(isoDate: string, now: Date = new Date()): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  let age = now.getFullYear() - year;
  const m = now.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && now.getDate() < day)) age--;
  return age;
}
