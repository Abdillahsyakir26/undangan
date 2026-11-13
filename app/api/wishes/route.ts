import { NextRequest, NextResponse } from 'next/server';
import { all, one, run } from '@/lib/db';
import { clientIp, isAdmin, rateLimit, sameOrigin } from '@/lib/security';
import { validateWish } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(sp.get('limit')) || 10, 1), 50);
  const before = Number(sp.get('before')) || 0;
  const rows = before
    ? await all('SELECT id, name, message, created_at FROM wishes WHERE id < ? ORDER BY id DESC LIMIT ?', [before, limit + 1])
    : await all('SELECT id, name, message, created_at FROM wishes ORDER BY id DESC LIMIT ?', [limit + 1]);
  const total = Number((await one<{ c: number }>('SELECT COUNT(*) c FROM wishes'))?.c ?? 0);
  return NextResponse.json({ items: rows.slice(0, limit), hasMore: rows.length > limit, total });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origin tidak valid' }, { status: 403 });
  const ip = clientIp(req);
  if (!rateLimit('wish:' + ip, 4, 10 * 60_000)) return NextResponse.json({ error: 'Terlalu banyak ucapan, coba lagi beberapa menit lagi.' }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });
  if (Date.now() - Number(body.t || 0) < 2500) return NextResponse.json({ error: 'Terlalu cepat, coba lagi.' }, { status: 429 });
  const r = validateWish(body as never);
  if (!r.ok) return NextResponse.json({ error: 'Periksa kembali isian Anda', fields: r.errors }, { status: 422 });
  const dup = await one("SELECT 1 FROM wishes WHERE name = ? AND message = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day')", [r.value.name, r.value.message]);
  if (dup) return NextResponse.json({ error: 'Ucapan yang sama sudah terkirim.' }, { status: 409 });
  const info = await run('INSERT INTO wishes (name, message) VALUES (?,?)', [r.value.name, r.value.message]);
  const row = await one('SELECT id, name, message, created_at FROM wishes WHERE id = ?', [info.lastId]);
  return NextResponse.json({ ok: true, item: row });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  await run('DELETE FROM wishes WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
