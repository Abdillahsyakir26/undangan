import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sharp from 'sharp';
import { run } from '@/lib/db';
import { isAdmin, sameOrigin } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const AUDIO: Record<string, string> = { mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav' };

// File disimpan sebagai BLOB di database → tidak perlu disk permanen / layanan storage terpisah.
export async function POST(req: NextRequest) {
  if (!isAdmin() || !sameOrigin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file');
  const kind = String(form.get('kind') || 'image');
  if (!(file instanceof File)) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomBytes(8).toString('hex');

  if (kind === 'audio') {
    if (buf.length > 4 * 1024 * 1024) return NextResponse.json({ error: 'Audio maksimal 4 MB (kompres dulu, mis. mp3 128 kbps)' }, { status: 413 });
    const ext = (file.name.match(/\.(mp3|m4a|ogg|wav)$/i)?.[1] || '').toLowerCase();
    if (!ext) return NextResponse.json({ error: 'Format audio tidak didukung (mp3/m4a/ogg/wav)' }, { status: 415 });
    await run('INSERT INTO media (name, type, data) VALUES (?,?,?)', [`${id}.${ext}`, AUDIO[ext], buf]);
    return NextResponse.json({ src: `/api/media/${id}.${ext}` });
  }

  if (buf.length > 12 * 1024 * 1024) return NextResponse.json({ error: 'Gambar maksimal 12 MB' }, { status: 413 });
  try {
    const base = sharp(buf, { failOn: 'error' }).rotate();
    const full = await base.clone().resize({ width: 1400, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    const thumb = await base.clone().resize({ width: 600, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
    await run('INSERT INTO media (name, type, data) VALUES (?,?,?)', [`${id}.webp`, 'image/webp', full]);
    await run('INSERT INTO media (name, type, data) VALUES (?,?,?)', [`${id}_t.webp`, 'image/webp', thumb]);
    return NextResponse.json({ src: `/api/media/${id}.webp`, thumb: `/api/media/${id}_t.webp` });
  } catch {
    return NextResponse.json({ error: 'File bukan gambar yang valid' }, { status: 415 });
  }
}
