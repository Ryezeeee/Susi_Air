// Display helpers. Dates are calendar dates ("YYYY-MM-DD"), always formatted in UTC
// so the output doesn't shift with the viewer's timezone.

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function parseIso(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d };
}

/** "2026-05-15" -> "15 May 2026" */
export function formatDate(date: string): string {
  const { y, m, d } = parseIso(date);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** "2026-05-15" -> "Fri, 15 May" */
export function formatDayLabel(date: string): string {
  const { y, m, d } = parseIso(date);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${d} ${MONTHS_SHORT[m - 1]}`;
}

export function monthName(month: number): string {
  return MONTHS_LONG[month - 1];
}

export function formatHours(h: number): string {
  return Number.isInteger(h) ? String(h) : h.toFixed(1);
}

/** White or navy text, whichever reads better on the given hex background. */
export function readableTextOn(hex: string): string {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  // Contrast vs white is (1.05)/(L+0.05); vs navy (#0E2138, L≈0.015) is (L+0.05)/0.065
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.065 ? '#FFFFFF' : '#0E2138';
}
