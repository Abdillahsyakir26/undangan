import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, clientIp, makeSession, rateLimit, sameOrigin, sessionCookie } from '@/lib/security';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Origin tidak valid' }, { status: 403 });
  if (!rateLimit('login:' + clientIp(req), 6, 15 * 60_000)) return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' }, { status: 429 });
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (typeof password !== 'string' || !checkPassword(password)) return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(makeSession()));
  return res;
}
