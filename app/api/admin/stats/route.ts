import { NextResponse } from 'next/server';
import { all, one } from '@/lib/db';
import { isAdmin } from '@/lib/security';

export const dynamic = 'force-dynamic';
const n = (v: unknown) => Number(v ?? 0);

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const v = await one("SELECT COUNT(*) views, COUNT(DISTINCT visitor) uniq FROM visits WHERE kind='view'");
  const o = await one("SELECT COUNT(DISTINCT visitor) opened FROM visits WHERE kind='open'");
  const r = await one('SELECT COUNT(*) total, COALESCE(SUM(attending=1),0) hadir, COALESCE(SUM(attending=0),0) tidak, COALESCE(SUM(guests),0) tamu FROM rsvp');
  const w = await one('SELECT COUNT(*) total FROM wishes');
  const daily = await all("SELECT substr(created_at,1,10) day, COUNT(DISTINCT visitor) n FROM visits WHERE kind='view' AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-14 day') GROUP BY day ORDER BY day");
  const guests = await all("SELECT guest, COUNT(*) n FROM visits WHERE kind='open' AND guest != '' GROUP BY guest ORDER BY n DESC LIMIT 10");
  return NextResponse.json({
    views: n(v?.views), uniq: n(v?.uniq), opened: n(o?.opened),
    rsvp: { total: n(r?.total), hadir: n(r?.hadir), tidak: n(r?.tidak), tamu: n(r?.tamu) },
    wishes: n(w?.total), daily, guests,
  });
}
