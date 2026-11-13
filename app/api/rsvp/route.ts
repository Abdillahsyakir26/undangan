import { NextRequest, NextResponse } from 'next/server';
import { all, run } from '@/lib/db';
import { clientIp, isAdmin, rateLimit, sameOrigin } from '@/lib/security';
import { validateRsvp } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origin tidak valid' }, { status: 403 });
  if (!rateLimit('rsvp:' + clientIp(req), 5, 10 * 60_000)) return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti.' }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 }); }
  // honeypot & waktu isi form
  if (body.website) return NextResponse.json({ ok: true });
  if (Date.now() - Number(body.t || 0) < 2000) return NextResponse.json({ error: 'Terlalu cepat, coba lagi.' }, { status: 429 });
  const r = validateRsvp(body as never);
  if (!r.ok) return NextResponse.json({ error: 'Periksa kembali isian Anda', fields: r.errors }, { status: 422 });
  const v = r.value;
  await run('INSERT INTO rsvp (name, phone, attending, guests, note) VALUES (?,?,?,?,?)', [v.name, v.phone, v.attending, v.guests, v.note]);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ items: await all('SELECT * FROM rsvp ORDER BY id DESC') });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  const id = Number(b.id);
  const r = validateRsvp(b);
  if (!id || !r.ok) return NextResponse.json({ error: 'Data tidak valid', fields: r.errors }, { status: 422 });
  const v = r.value;
  await run('UPDATE rsvp SET name=?, phone=?, attending=?, guests=?, note=? WHERE id=?', [v.name, v.phone, v.attending, v.guests, v.note, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  await run('DELETE FROM rsvp WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
