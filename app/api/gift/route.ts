import { NextRequest, NextResponse } from 'next/server';
import { all, run } from '@/lib/db';
import { clean } from '@/lib/validate';
import { clientIp, isAdmin, rateLimit, sameOrigin } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origin tidak valid' }, { status: 403 });
  if (!rateLimit('gift:' + clientIp(req), 3, 10 * 60_000)) return NextResponse.json({ error: 'Terlalu banyak permintaan.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true });
  const name = clean(b.name, 60), detail = clean(b.detail, 300);
  if (name.length < 2) return NextResponse.json({ error: 'Isi nama pengirim', fields: { name: 'Nama minimal 2 karakter' } }, { status: 422 });
  await run('INSERT INTO gift_confirm (name, detail) VALUES (?,?)', [name, detail]);
  return NextResponse.json({ ok: true });
}
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ items: await all('SELECT * FROM gift_confirm ORDER BY id DESC') });
}
export async function DELETE(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await run('DELETE FROM gift_confirm WHERE id = ?', [Number(new URL(req.url).searchParams.get('id'))]);
  return NextResponse.json({ ok: true });
}
