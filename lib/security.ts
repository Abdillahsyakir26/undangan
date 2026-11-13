import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE = 'adm_session';
const TTL = 60 * 60 * 12; // 12 jam

function secret() {
  return process.env.AUTH_SECRET || crypto.createHash('sha256').update('undangan:' + (process.env.ADMIN_PASSWORD || 'admin123')).digest('hex');
}
const sign = (v: string) => crypto.createHmac('sha256', secret()).update(v).digest('hex');
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export function checkPassword(pw: string) {
  return safeEq(crypto.createHash('sha256').update(pw).digest('hex'), crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD || 'admin123').digest('hex'));
}
export function makeSession() {
  const exp = String(Math.floor(Date.now() / 1000) + TTL);
  return `${exp}.${sign(exp)}`;
}
export function sessionCookie(value: string, maxAge = TTL) {
  return { name: COOKIE, value, httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge };
}
export function isAdmin(): boolean {
  const v = cookies().get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || !safeEq(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

// ---- rate limit (in-memory) ----
const buckets = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { buckets.set(key, arr); return false; }
  arr.push(now); buckets.set(key, arr);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  return true;
}
export function clientIp(req: NextRequest) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
}
export function sameOrigin(req: NextRequest) {
  const o = req.headers.get('origin');
  if (!o) return true;
  try { return new URL(o).host === req.headers.get('host'); } catch { return false; }
}
