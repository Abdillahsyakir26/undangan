import { NextRequest, NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/db';
import { isAdmin, sameOrigin } from '@/lib/security';
import type { SiteConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getConfig());
}

export async function PUT(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as SiteConfig | null;
  if (!b || typeof b !== 'object') return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  const errors: string[] = [];
  if (!/^[a-z0-9-]{2,40}$/.test(b.slug || '')) errors.push('Slug hanya huruf kecil, angka, dan tanda minus (2–40 karakter)');
  if (['admin', 'api', '_next', 'orn', 'demo', 'audio'].includes(b.slug)) errors.push('Slug tersebut dicadangkan sistem');
  if (isNaN(Date.parse(b.weddingDate))) errors.push('Tanggal pernikahan tidak valid');
  if (!b.couple?.groom?.name || !b.couple?.bride?.name) errors.push('Nama mempelai wajib diisi');
  for (const e of b.events || []) if (e.mapsUrl && !/^https:\/\//.test(e.mapsUrl)) errors.push(`Tautan maps "${e.title}" harus diawali https://`);
  for (const k of ['gold', 'goldDeep', 'sage', 'sageDeep', 'cream', 'creamDeep', 'ink'] as const)
    if (!/^\d{1,3} \d{1,3} \d{1,3}$/.test(b.theme?.[k] || '')) errors.push(`Warna ${k} tidak valid`);
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 422 });
  await saveConfig(b);
  return NextResponse.json({ ok: true });
}
