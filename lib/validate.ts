// Dipakai di frontend DAN backend (validasi ganda)
export const LIMITS = { name: 60, phone: 20, note: 300, message: 500, maxGuests: 10 };

// buang karakter kontrol & tag HTML sederhana; React tetap meng-escape saat render
export function clean(s: unknown, max: number) {
  return String(s ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, max);
}
const urlRe = /(https?:\/\/|www\.)/gi;

export type FieldErrors = Record<string, string>;

export function validateRsvp(i: { name?: string; phone?: string; attending?: unknown; guests?: unknown; note?: string }) {
  const e: FieldErrors = {};
  const v = {
    name: clean(i.name, LIMITS.name),
    phone: clean(i.phone, LIMITS.phone).replace(/[^\d+]/g, ''),
    attending: i.attending === 1 || i.attending === '1' || i.attending === true ? 1 : 0,
    guests: Math.round(Number(i.guests) || 1),
    note: clean(i.note, LIMITS.note),
  };
  if (v.name.length < 2) e.name = 'Nama minimal 2 karakter';
  if (i.attending !== 0 && i.attending !== 1 && i.attending !== '0' && i.attending !== '1' && typeof i.attending !== 'boolean') e.attending = 'Pilih salah satu';
  if (v.phone && !/^(\+?62|0)8\d{7,12}$/.test(v.phone)) e.phone = 'Nomor WhatsApp tidak valid (contoh 0812xxxxxxx)';
  if (v.attending === 1 && (v.guests < 1 || v.guests > LIMITS.maxGuests)) e.guests = `Jumlah tamu 1–${LIMITS.maxGuests}`;
  if (v.attending === 0) v.guests = 0;
  return { ok: Object.keys(e).length === 0, errors: e, value: v };
}

export function validateWish(i: { name?: string; message?: string }) {
  const e: FieldErrors = {};
  const v = { name: clean(i.name, LIMITS.name), message: clean(i.message, LIMITS.message) };
  if (v.name.length < 2) e.name = 'Nama minimal 2 karakter';
  if (v.message.length < 3) e.message = 'Ucapan minimal 3 karakter';
  if ((v.message.match(urlRe) || []).length > 0) e.message = 'Tautan tidak diperbolehkan pada ucapan';
  if (/(.)\1{9,}/.test(v.message)) e.message = 'Ucapan terlihat seperti spam';
  return { ok: Object.keys(e).length === 0, errors: e, value: v };
}
