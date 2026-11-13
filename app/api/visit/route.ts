import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';
import { clean } from '@/lib/validate';
import { clientIp, rateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!rateLimit('visit:' + clientIp(req), 30, 10 * 60_000)) return NextResponse.json({ ok: true });
  try {
    const b = await req.json();
    const visitor = clean(b.visitor, 40).replace(/[^\w-]/g, '');
    const kind = b.kind === 'open' ? 'open' : 'view';
    if (!visitor) return NextResponse.json({ ok: false }, { status: 400 });
    await run('INSERT INTO visits (visitor, guest, kind) VALUES (?,?,?)', [visitor, clean(b.guest, 60), kind]);
  } catch { /* abaikan */ }
  return NextResponse.json({ ok: true });
}
