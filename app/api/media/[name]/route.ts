import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const name = params.name;
  if (!/^[a-f0-9]{16}(_t)?\.(webp|mp3|m4a|ogg|wav)$/.test(name)) return new NextResponse('Not found', { status: 404 });
  const row = await one<{ type: string; data: ArrayBuffer }>('SELECT type, data FROM media WHERE name = ?', [name]);
  if (!row) return new NextResponse('Not found', { status: 404 });
  const buf = Buffer.from(row.data);
  const size = buf.length;
  const h: Record<string, string> = { 'Content-Type': row.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable' };
  const range = req.headers.get('range');
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1], 10) : 0;
    const end = m && m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
    if (start >= size || start > end) return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new NextResponse(buf.subarray(start, end + 1), { status: 206, headers: { ...h, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) } });
  }
  return new NextResponse(buf, { headers: { ...h, 'Content-Length': String(size) } });
}
