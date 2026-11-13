import { createClient, type Client, type InValue } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from './defaults';
import type { SiteConfig } from './types';

/**
 * Produksi : set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (paket gratis Turso, cocok untuk Vercel)
 * Lokal    : otomatis memakai file data/undangan.db (tanpa akun apa pun)
 */
declare global {
  // eslint-disable-next-line no-var
  var __libsql: { client: Client; ready: Promise<void> } | undefined;
}

function init() {
  let url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    fs.mkdirSync(dir, { recursive: true });
    url = 'file:' + path.join(dir, 'undangan.db');
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  const ready = (async () => {
    await client.batch([
      'CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
      `CREATE TABLE IF NOT EXISTS rsvp (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
        attending INTEGER NOT NULL, guests INTEGER NOT NULL DEFAULT 1, note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
      `CREATE TABLE IF NOT EXISTS wishes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, message TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
      `CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY AUTOINCREMENT, visitor TEXT NOT NULL, guest TEXT NOT NULL DEFAULT '',
        kind TEXT NOT NULL DEFAULT 'view', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
      'CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at)',
      `CREATE TABLE IF NOT EXISTS gift_confirm (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
      'CREATE TABLE IF NOT EXISTS media (name TEXT PRIMARY KEY, type TEXT NOT NULL, data BLOB NOT NULL)',
    ], 'write');
    await client.execute({ sql: 'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)', args: ['site', JSON.stringify(DEFAULT_CONFIG)] });
  })();
  return { client, ready };
}

async function conn() {
  if (!global.__libsql) global.__libsql = init();
  await global.__libsql.ready;
  return global.__libsql.client;
}

export type Row = Record<string, unknown>;

/** SELECT → array objek biasa */
export async function all<T = Row>(sql: string, args: InValue[] = []): Promise<T[]> {
  const rs = await (await conn()).execute({ sql, args });
  return rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, r[i] instanceof ArrayBuffer ? r[i] : r[i]]))) as T[];
}
export async function one<T = Row>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}
/** INSERT/UPDATE/DELETE → { lastId } */
export async function run(sql: string, args: InValue[] = []) {
  const rs = await (await conn()).execute({ sql, args });
  return { lastId: Number(rs.lastInsertRowid ?? 0), changes: rs.rowsAffected };
}

function merge<T>(base: T, over: unknown): T {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return (over === undefined || over === null ? base : over) as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const o = (over && typeof over === 'object' ? over : {}) as Record<string, unknown>;
  for (const k of Object.keys(out)) if (k in o) out[k] = merge((base as Record<string, unknown>)[k], o[k]);
  return out as T;
}
export async function getConfig(): Promise<SiteConfig> {
  const row = await one<{ value: string }>('SELECT value FROM config WHERE key = ?', ['site']);
  try { return merge(DEFAULT_CONFIG, row ? JSON.parse(row.value) : {}); } catch { return DEFAULT_CONFIG; }
}
export async function saveConfig(cfg: SiteConfig) {
  await run('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', ['site', JSON.stringify(cfg)]);
}
