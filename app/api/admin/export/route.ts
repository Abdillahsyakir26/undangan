import { NextResponse } from 'next/server';
import { all } from '@/lib/db';
import { isAdmin } from '@/lib/security';

export const dynamic = 'force-dynamic';
const esc = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // cegah CSV injection
  return `"${s.replace(/"/g, '""')}"`;
};
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await all('SELECT * FROM rsvp ORDER BY id');
  const csv = ['id,nama,whatsapp,hadir,jumlah,catatan,waktu', ...rows.map((r) => [r.id, esc(r.name), esc(r.phone), r.attending ? 'Hadir' : 'Tidak hadir', r.guests, esc(r.note), r.created_at].join(','))].join('\n');
  return new NextResponse('﻿' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="rsvp.csv"' } });
}
