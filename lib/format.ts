import type { EventItem } from './types';

const OFFSET: Record<string, string> = { WIB: '+07:00', WITA: '+08:00', WIT: '+09:00' };
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Hindari Intl agar server & client selalu identik (tidak ada hydration mismatch)
function parts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  return { y, mo, d, dow: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() };
}
export function dateLong(iso: string) {
  const p = parts(iso); if (!p) return iso;
  return `${DAYS[p.dow]}, ${p.d} ${MONTHS[p.mo - 1]} ${p.y}`;
}
export function dateParts(iso: string) {
  const p = parts(iso); if (!p) return { day: '', dow: '', month: '', year: '', d: 0 };
  return { dow: DAYS[p.dow], day: String(p.d).padStart(2, '0'), d: p.d, month: MONTHS[p.mo - 1], year: String(p.y) };
}
export function dateShort(iso: string) {
  const p = parts(iso); if (!p) return iso;
  return `${String(p.d).padStart(2, '0')}.${String(p.mo).padStart(2, '0')}.${p.y}`;
}
export function dateTimeId(iso: string) {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  if (isNaN(+d)) return '';
  const wib = new Date(d.getTime() + 7 * 3600_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()].slice(0, 3)} ${wib.getUTCFullYear()}, ${pad(wib.getUTCHours())}.${pad(wib.getUTCMinutes())} WIB`;
}
export function timeAgo(iso: string, now = Date.now()) {
  const t = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} hari lalu`;
  return dateTimeId(iso).split(',')[0];
}
export const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

const toUtcStamp = (date: string, time: string, tz: string) => {
  const d = new Date(`${date}T${time}:00${OFFSET[tz] || '+07:00'}`);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};
export function googleCalUrl(e: EventItem, couple: string) {
  const u = new URL('https://calendar.google.com/calendar/render');
  u.searchParams.set('action', 'TEMPLATE');
  u.searchParams.set('text', `${e.title} ${couple}`);
  u.searchParams.set('dates', `${toUtcStamp(e.date, e.start, e.tz)}/${toUtcStamp(e.date, e.end, e.tz)}`);
  u.searchParams.set('location', `${e.venue}, ${e.address}`);
  u.searchParams.set('details', `Undangan pernikahan ${couple}`);
  return u.toString();
}
export function icsContent(e: EventItem, couple: string) {
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan//ID', 'BEGIN:VEVENT',
    `UID:${e.id}-${e.date}@undangan`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${toUtcStamp(e.date, e.start, e.tz)}`, `DTEND:${toUtcStamp(e.date, e.end, e.tz)}`,
    `SUMMARY:${esc(`${e.title} ${couple}`)}`, `LOCATION:${esc(`${e.venue}, ${e.address}`)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:Besok: ${esc(e.title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
export const mapQuery = (e: EventItem) => encodeURIComponent(`${e.venue} ${e.address}`);
