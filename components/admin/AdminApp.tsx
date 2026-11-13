'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Copy, Download, Gift, HeartHandshake, Image as ImageIcon, Link2, LogOut, MessageSquare, Music2, Palette, Plus, Save, Trash2, Users, BookHeart, Upload, Pencil, X } from 'lucide-react';
import type { BankItem, EventItem, GalleryItem, Rsvp, SiteConfig, StoryItem, Wish } from '@/lib/types';
import { dateTimeId } from '@/lib/format';

type Tab = 'stats' | 'couple' | 'events' | 'story' | 'gallery' | 'music' | 'theme' | 'rsvp' | 'wishes' | 'gift' | 'links';
const TABS: { id: Tab; label: string; Icon: typeof Users }[] = [
  { id: 'stats', label: 'Ringkasan', Icon: BarChart3 }, { id: 'couple', label: 'Mempelai', Icon: HeartHandshake },
  { id: 'events', label: 'Tanggal & Acara', Icon: CalendarDays }, { id: 'story', label: 'Cerita', Icon: BookHeart },
  { id: 'gallery', label: 'Galeri', Icon: ImageIcon }, { id: 'music', label: 'Musik', Icon: Music2 },
  { id: 'theme', label: 'Tema', Icon: Palette }, { id: 'rsvp', label: 'RSVP', Icon: Users },
  { id: 'wishes', label: 'Ucapan', Icon: MessageSquare }, { id: 'gift', label: 'Hadiah', Icon: Gift }, { id: 'links', label: 'Link Tamu', Icon: Link2 },
];
const uid = () => Math.random().toString(36).slice(2, 9);

async function api<T = unknown>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
}

/* ---------- field kecil ---------- */
const inp = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600';
function F({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block text-sm"><span className="font-medium text-stone-700">{label}</span><div className="mt-1">{children}</div>{hint && <span className="text-xs text-stone-500">{hint}</span>}</label>;
}
function T({ v, on, ...p }: { v: string; on: (s: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input className={inp} value={v} onChange={(e) => on(e.target.value)} {...p} />;
}
function TA({ v, on, rows = 3 }: { v: string; on: (s: string) => void; rows?: number }) {
  return <textarea className={inp} rows={rows} value={v} onChange={(e) => on(e.target.value)} />;
}
const Card = ({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5 mb-5">
    {(title || action) && <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-stone-800">{title}</h3>{action}</div>}
    {children}
  </div>
);
const Btn = ({ children, kind = 'pri', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: 'pri' | 'ghost' | 'danger' }) => (
  <button {...p} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${kind === 'pri' ? 'bg-amber-700 text-white hover:bg-amber-800' : kind === 'danger' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'} ${p.className || ''}`}>{children}</button>
);

// Perkecil di browser dulu: Vercel membatasi body request ±4,5 MB
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < 600 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const k = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch { return file; }
}
async function upload(file: File, kind: 'image' | 'audio' = 'image') {
  if (kind === 'audio' && file.size > 4 * 1024 * 1024) throw new Error('Audio maksimal 4 MB (kompres dulu, mis. mp3 96–128 kbps)');
  if (kind === 'image') file = await shrink(file);
  const fd = new FormData(); fd.append('file', file); fd.append('kind', kind);
  const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Upload gagal');
  return d as { src: string; thumb?: string };
}
function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (src: string) => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  return (
    <F label={label}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" className="w-16 h-16 rounded-lg object-cover border" /> : <div className="w-16 h-16 rounded-lg border border-dashed grid place-items-center text-stone-400 text-xs">kosong</div>}
        <label className="cursor-pointer"><span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-2 text-sm"><Upload size={15} />{busy ? 'Mengunggah…' : 'Unggah'}</span>
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); setErr(''); try { onChange((await upload(f)).src); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); e.target.value = ''; } }} /></label>
        {value && <Btn kind="ghost" type="button" onClick={() => onChange('')}>Hapus</Btn>}
      </div>
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </F>
  );
}

/* ---------- login ---------- */
function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  return (
    <main className="min-h-dvh grid place-items-center bg-stone-100 p-5">
      <form className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-7 space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pw }) }); setBusy(false); if (r.ok) onOk(); else setErr(r.data.error || 'Gagal masuk'); }}>
        <h1 className="text-xl font-semibold">Admin Undangan</h1>
        <F label="Password"><input type="password" autoFocus className={inp} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></F>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <Btn type="submit" disabled={busy} className="w-full justify-center">{busy ? 'Memeriksa…' : 'Masuk'}</Btn>
      </form>
    </main>
  );
}

/* ---------- tab: statistik ---------- */
type Stats = { views: number; uniq: number; opened: number; rsvp: { total: number; hadir: number; tidak: number; tamu: number }; wishes: number; daily: { day: string; n: number }[]; guests: { guest: string; n: number }[] };
function StatsTab() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { api<Stats>('/api/admin/stats').then((r) => r.ok && setS(r.data)); }, []);
  if (!s) return <p className="text-stone-500">Memuat…</p>;
  const max = Math.max(1, ...s.daily.map((d) => d.n));
  const tiles = [['Total kunjungan', s.views], ['Pengunjung unik', s.uniq], ['Membuka undangan', s.opened], ['Konfirmasi RSVP', s.rsvp.total], ['Hadir (orang)', s.rsvp.tamu], ['Tidak hadir', s.rsvp.tidak], ['Ucapan', s.wishes]] as const;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{tiles.map(([l, v]) => <div key={l} className="rounded-2xl bg-white border border-stone-200 p-4"><p className="text-xs text-stone-500">{l}</p><p className="text-3xl font-semibold mt-1 text-amber-800">{v}</p></div>)}</div>
      <Card title="Pengunjung unik 14 hari terakhir">
        {s.daily.length === 0 ? <p className="text-sm text-stone-500">Belum ada data.</p> : (
          <div className="flex items-end gap-2 h-40">{s.daily.map((d) => <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1"><span className="text-[11px] text-stone-600">{d.n}</span><div className="w-full rounded-t bg-amber-600/80" style={{ height: `${(d.n / max) * 100}%`, minHeight: 4 }} /><span className="text-[10px] text-stone-500">{d.day.slice(8)}/{d.day.slice(5, 7)}</span></div>)}</div>
        )}
      </Card>
      <Card title="Tamu yang sudah membuka undangan (nama dari link)">
        {s.guests.length === 0 ? <p className="text-sm text-stone-500">Belum ada.</p> : <ul className="text-sm divide-y">{s.guests.map((g) => <li key={g.guest} className="py-1.5 flex justify-between"><span>{g.guest}</span><span className="text-stone-500">{g.n}×</span></li>)}</ul>}
      </Card>
    </>
  );
}

/* ---------- list editor ---------- */
function Move({ i, len, move }: { i: number; len: number; move: (a: number, b: number) => void }) {
  return <span className="inline-flex gap-1"><Btn kind="ghost" type="button" disabled={i === 0} onClick={() => move(i, i - 1)}>↑</Btn><Btn kind="ghost" type="button" disabled={i === len - 1} onClick={() => move(i, i + 1)}>↓</Btn></span>;
}
function reorder<T>(arr: T[], a: number, b: number) { const c = [...arr]; const [x] = c.splice(a, 1); c.splice(b, 0, x); return c; }

/* ---------- RSVP ---------- */
function RsvpTab() {
  const [items, setItems] = useState<Rsvp[]>([]); const [edit, setEdit] = useState<Rsvp | null>(null); const [q, setQ] = useState(''); const [f, setF] = useState<'all' | '1' | '0'>('all'); const [msg, setMsg] = useState('');
  const load = useCallback(() => api<{ items: Rsvp[] }>('/api/rsvp').then((r) => r.ok && setItems(r.data.items)), []);
  useEffect(() => { load(); }, [load]);
  const list = items.filter((i) => (f === 'all' || String(i.attending) === f) && i.name.toLowerCase().includes(q.toLowerCase()));
  const hadir = items.filter((i) => i.attending).reduce((a, b) => a + b.guests, 0);
  return (
    <Card title={`RSVP (${items.length} konfirmasi · ${hadir} tamu hadir)`} action={<a href="/api/admin/export" className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-2 text-sm"><Download size={15} />Ekspor CSV</a>}>
      <div className="flex gap-2 mb-3 flex-wrap"><input className={inp + ' max-w-xs'} placeholder="Cari nama…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inp + ' max-w-[10rem]'} value={f} onChange={(e) => setF(e.target.value as 'all')}><option value="all">Semua</option><option value="1">Hadir</option><option value="0">Tidak hadir</option></select></div>
      {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-stone-500 border-b"><th className="py-2 pr-3">Nama</th><th className="pr-3">WA</th><th className="pr-3">Status</th><th className="pr-3">Tamu</th><th className="pr-3">Catatan</th><th className="pr-3">Waktu</th><th /></tr></thead>
        <tbody>{list.map((r) => <tr key={r.id} className="border-b align-top"><td className="py-2 pr-3 font-medium">{r.name}</td><td className="pr-3">{r.phone || '–'}</td><td className="pr-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.attending ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`}>{r.attending ? 'Hadir' : 'Tidak'}</span></td><td className="pr-3">{r.guests}</td><td className="pr-3 max-w-[200px]">{r.note || '–'}</td><td className="pr-3 whitespace-nowrap text-stone-500">{dateTimeId(r.created_at)}</td>
          <td className="whitespace-nowrap"><Btn kind="ghost" onClick={() => setEdit(r)}><Pencil size={14} /></Btn> <Btn kind="danger" onClick={async () => { if (confirm(`Hapus RSVP ${r.name}?`)) { await api(`/api/rsvp?id=${r.id}`, { method: 'DELETE' }); load(); } }}><Trash2 size={14} /></Btn></td></tr>)}
          {list.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-stone-500">Belum ada data.</td></tr>}</tbody></table></div>
      {edit && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setEdit(null)}>
          <form className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()} onSubmit={async (e) => { e.preventDefault(); const r = await api('/api/rsvp', { method: 'PUT', body: JSON.stringify(edit) }); if (r.ok) { setEdit(null); load(); } else setMsg(r.data.error || 'Gagal'); }}>
            <div className="flex justify-between"><h4 className="font-semibold">Ubah RSVP</h4><button type="button" onClick={() => setEdit(null)}><X size={18} /></button></div>
            <F label="Nama"><T v={edit.name} on={(v) => setEdit({ ...edit, name: v })} /></F>
            <F label="WhatsApp"><T v={edit.phone} on={(v) => setEdit({ ...edit, phone: v })} /></F>
            <div className="grid grid-cols-2 gap-3"><F label="Status"><select className={inp} value={edit.attending} onChange={(e) => setEdit({ ...edit, attending: Number(e.target.value) as 0 | 1 })}><option value={1}>Hadir</option><option value={0}>Tidak hadir</option></select></F><F label="Jumlah"><input type="number" min={0} max={10} className={inp} value={edit.guests} onChange={(e) => setEdit({ ...edit, guests: Number(e.target.value) })} /></F></div>
            <F label="Catatan"><TA v={edit.note} on={(v) => setEdit({ ...edit, note: v })} /></F>
            <Btn type="submit">Simpan</Btn>
          </form>
        </div>
      )}
    </Card>
  );
}

function WishesTab() {
  const [items, setItems] = useState<Wish[]>([]);
  const load = useCallback(() => api<{ items: Wish[] }>('/api/wishes?limit=50').then((r) => r.ok && setItems(r.data.items)), []);
  useEffect(() => { load(); }, [load]);
  return (
    <Card title="Ucapan tamu (50 terbaru)">
      <ul className="divide-y">{items.map((w) => <li key={w.id} className="py-3 flex gap-3 justify-between"><div><p className="font-medium">{w.name} <span className="text-xs text-stone-500 font-normal">{dateTimeId(w.created_at)}</span></p><p className="text-sm text-stone-700 whitespace-pre-line break-words">{w.message}</p></div>
        <Btn kind="danger" onClick={async () => { if (confirm('Hapus ucapan ini?')) { await api(`/api/wishes?id=${w.id}`, { method: 'DELETE' }); load(); } }}><Trash2 size={14} /></Btn></li>)}
        {items.length === 0 && <li className="py-6 text-center text-stone-500">Belum ada ucapan.</li>}</ul>
    </Card>
  );
}

function GiftConfirms() {
  const [items, setItems] = useState<{ id: number; name: string; detail: string; created_at: string }[]>([]);
  const load = useCallback(() => api<{ items: typeof items }>('/api/gift').then((r) => r.ok && setItems(r.data.items)), []);
  useEffect(() => { load(); }, [load]);
  return (
    <Card title="Konfirmasi pengiriman hadiah">
      <ul className="divide-y">{items.map((g) => <li key={g.id} className="py-2 flex justify-between gap-3"><div><p className="font-medium">{g.name} <span className="text-xs text-stone-500 font-normal">{dateTimeId(g.created_at)}</span></p><p className="text-sm text-stone-600">{g.detail || '–'}</p></div><Btn kind="danger" onClick={async () => { await api(`/api/gift?id=${g.id}`, { method: 'DELETE' }); load(); }}><Trash2 size={14} /></Btn></li>)}
        {items.length === 0 && <li className="py-4 text-center text-stone-500 text-sm">Belum ada.</li>}</ul>
    </Card>
  );
}

/* ---------- link tamu ---------- */
function LinksTab({ slug, wedding }: { slug: string; wedding: string }) {
  const [text, setText] = useState('');
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(location.origin), []);
  const names = useMemo(() => text.split('\n').map((s) => s.trim()).filter(Boolean), [text]);
  const link = (n: string) => `${origin}/${slug}?to=${encodeURIComponent(n)}`;
  const msg = (n: string) => `Assalamu'alaikum Wr. Wb.\n\nKepada Yth. ${n},\n\nDengan penuh rasa syukur, kami mengundang Anda ke acara pernikahan kami. Detail undangan dapat dibuka melalui tautan berikut:\n${link(n)}\n\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir.\n\nTerima kasih.`;
  return (
    <Card title="Generator link undangan per tamu">
      <p className="text-sm text-stone-600 mb-3">Satu nama per baris. Tautan berformat <code className="bg-stone-100 px-1 rounded">/{slug}?to=Nama</code>.</p>
      <textarea className={inp} rows={5} placeholder={'Ahmad\nBapak Budi & Keluarga\nIbu Siti'} value={text} onChange={(e) => setText(e.target.value)} />
      <ul className="mt-4 divide-y">{names.map((n) => <li key={n} className="py-2 flex flex-wrap items-center gap-2 justify-between"><div className="min-w-0"><p className="font-medium">{n}</p><p className="text-xs text-stone-500 truncate max-w-[60vw]">{link(n)}</p></div>
        <div className="flex gap-2"><Btn kind="ghost" onClick={() => navigator.clipboard?.writeText(link(n))}><Copy size={14} />Salin</Btn><a className="inline-flex items-center rounded-lg bg-green-600 text-white px-3 py-2 text-sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(msg(n))}`}>WhatsApp</a></div></li>)}</ul>
      {names.length > 0 && <Btn className="mt-3" onClick={() => navigator.clipboard?.writeText(names.map((n) => `${n}\t${link(n)}`).join('\n'))}><Copy size={14} />Salin semua (nama ⇥ link)</Btn>}
      <p className="text-xs text-stone-500 mt-3">Tanggal acara: {wedding.slice(0, 10)}</p>
    </Card>
  );
}

/* ---------- warna ---------- */
const toHex = (rgb: string) => '#' + rgb.split(' ').map((n) => Number(n).toString(16).padStart(2, '0')).join('');
const fromHex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
const PRESETS: Record<string, SiteConfig['theme']> = {
  'Emas & Sage (bawaan)': { gold: '184 134 74', goldDeep: '140 96 48', sage: '135 145 100', sageDeep: '88 99 66', cream: '250 243 231', creamDeep: '240 227 206', ink: '62 48 34' },
  'Emas & Maroon': { gold: '184 134 74', goldDeep: '128 40 52', sage: '150 96 96', sageDeep: '110 38 50', cream: '252 244 236', creamDeep: '242 226 214', ink: '58 36 36' },
  'Emas & Navy': { gold: '188 144 82', goldDeep: '42 62 100', sage: '110 130 150', sageDeep: '36 58 90', cream: '246 244 238', creamDeep: '232 230 222', ink: '34 42 58' },
  'Rose & Dusty': { gold: '196 140 124', goldDeep: '160 96 90', sage: '150 160 130', sageDeep: '100 112 90', cream: '253 246 242', creamDeep: '246 232 226', ink: '70 48 48' },
};

/* ---------- utama ---------- */
export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [tab, setTab] = useState<Tab>('stats');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);

  const load = useCallback(async () => { const r = await api<SiteConfig>('/api/admin/config'); if (r.status === 401) { setAuthed(false); return; } setCfg(r.data as SiteConfig); setAuthed(true); setDirty(false); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!dirty) return; const f = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener('beforeunload', f); return () => window.removeEventListener('beforeunload', f); }, [dirty]);

  if (authed === null) return <main className="min-h-dvh grid place-items-center text-stone-500">Memuat…</main>;
  if (!authed || !cfg) return <Login onOk={load} />;

  const set = (fn: (c: SiteConfig) => void) => { const c = structuredClone(cfg); fn(c); setCfg(c); setDirty(true); };
  async function save() {
    setSaving(true); const r = await api('/api/admin/config', { method: 'PUT', body: JSON.stringify(cfg) }); setSaving(false);
    if (r.ok) { setDirty(false); setNote({ t: 'ok', m: 'Tersimpan ✓' }); } else setNote({ t: 'err', m: r.data.error || 'Gagal menyimpan' });
    setTimeout(() => setNote(null), 3500);
  }
  const wd = cfg.weddingDate; const wDate = wd.slice(0, 10); const wTime = wd.slice(11, 16); const wOff = wd.slice(19) || '+07:00';
  const setWd = (d: string, t: string, o: string) => set((c) => { c.weddingDate = `${d}T${t}:00${o}`; });

  const PersonForm = ({ who, title }: { who: 'groom' | 'bride'; title: string }) => {
    const p = cfg.couple[who];
    return (
      <Card title={title}>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Nama lengkap"><T v={p.name} on={(v) => set((c) => { c.couple[who].name = v; })} /></F>
          <F label="Nama panggilan"><T v={p.nick} on={(v) => set((c) => { c.couple[who].nick = v; })} /></F>
          <F label="Urutan anak"><T v={p.childOrder} on={(v) => set((c) => { c.couple[who].childOrder = v; })} /></F>
          <ImageField label="Foto" value={p.photo} onChange={(v) => set((c) => { c.couple[who].photo = v; })} />
          <F label="Nama ayah"><T v={p.father} on={(v) => set((c) => { c.couple[who].father = v; })} /></F>
          <F label="Nama ibu"><T v={p.mother} on={(v) => set((c) => { c.couple[who].mother = v; })} /></F>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-800 md:flex">
      <aside className="md:w-60 md:min-h-dvh bg-white border-b md:border-r border-stone-200 md:sticky md:top-0 md:self-start md:h-dvh overflow-auto">
        <div className="p-4 font-semibold text-amber-800 hidden md:block">Admin Undangan</div>
        <nav className="flex md:block overflow-x-auto p-2 gap-1">{TABS.map(({ id, label, Icon }) => <button key={id} onClick={() => setTab(id)} className={`whitespace-nowrap flex items-center gap-2 rounded-lg px-3 py-2 text-sm md:w-full text-left ${tab === id ? 'bg-amber-100 text-amber-900 font-medium' : 'hover:bg-stone-100'}`}><Icon size={16} />{label}</button>)}</nav>
        <div className="p-3 hidden md:block"><a className="block text-sm text-amber-800 underline mb-3" href={`/${cfg.slug}`} target="_blank" rel="noopener noreferrer">Lihat undangan ↗</a><Btn kind="ghost" onClick={async () => { await api('/api/admin/logout', { method: 'POST' }); setAuthed(false); }}><LogOut size={14} />Keluar</Btn></div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-4xl pb-28">
        {tab === 'stats' && <StatsTab />}
        {tab === 'couple' && (<>
          <PersonForm who="groom" title="Mempelai Pria" /><PersonForm who="bride" title="Mempelai Wanita" />
          <Card title="Deskripsi & kutipan">
            <div className="grid gap-4">
              <F label="Deskripsi singkat pasangan"><TA v={cfg.couple.description} on={(v) => set((c) => { c.couple.description = v; })} /></F>
              <F label="Ayat / kutipan (Arab, opsional)"><TA v={cfg.couple.quote.arab} on={(v) => set((c) => { c.couple.quote.arab = v; })} /></F>
              <F label="Terjemahan / kutipan"><TA v={cfg.couple.quote.text} on={(v) => set((c) => { c.couple.quote.text = v; })} /></F>
              <F label="Sumber"><T v={cfg.couple.quote.source} on={(v) => set((c) => { c.couple.quote.source = v; })} /></F>
              <ImageField label="Foto cover (opsional, tampil di gapura & latar hero)" value={cfg.coverPhoto} onChange={(v) => set((c) => { c.coverPhoto = v; })} />
            </div>
          </Card>
          <Card title="Penutup">
            <div className="grid gap-4">
              <F label="Ucapan terima kasih"><TA v={cfg.closing.thanks} on={(v) => set((c) => { c.closing.thanks = v; })} /></F>
              <F label="Doa penutup"><TA v={cfg.closing.doa} on={(v) => set((c) => { c.closing.doa = v; })} /></F>
              <F label="Kutipan penutup"><TA v={cfg.closing.quote} on={(v) => set((c) => { c.closing.quote = v; })} /></F>
            </div>
          </Card>
        </>)}
        {tab === 'events' && (<>
          <Card title="Pengaturan umum">
            <div className="grid md:grid-cols-2 gap-4">
              <F label="Judul website (untuk preview WhatsApp)"><T v={cfg.siteTitle} on={(v) => set((c) => { c.siteTitle = v; })} /></F>
              <F label="Slug URL" hint="Alamat: /slug?to=NamaTamu"><T v={cfg.slug} on={(v) => set((c) => { c.slug = v.toLowerCase().replace(/[^a-z0-9-]/g, ''); })} /></F>
              <F label="Tanggal pernikahan (countdown)"><input type="date" className={inp} value={wDate} onChange={(e) => setWd(e.target.value, wTime, wOff)} /></F>
              <div className="grid grid-cols-2 gap-3"><F label="Jam"><input type="time" className={inp} value={wTime} onChange={(e) => setWd(wDate, e.target.value, wOff)} /></F>
                <F label="Zona waktu"><select className={inp} value={wOff} onChange={(e) => setWd(wDate, wTime, e.target.value)}><option value="+07:00">WIB</option><option value="+08:00">WITA</option><option value="+09:00">WIT</option></select></F></div>
              <F label="Nomor WhatsApp pengundang" hint="Format internasional tanpa +, mis. 6281234567890"><T v={cfg.whatsapp} on={(v) => set((c) => { c.whatsapp = v.replace(/\D/g, ''); })} /></F>
            </div>
          </Card>
          {cfg.events.map((e, i) => (
            <Card key={e.id} title={`Acara ${i + 1}: ${e.title}`} action={<span className="flex gap-1"><Move i={i} len={cfg.events.length} move={(a, b) => set((c) => { c.events = reorder(c.events, a, b); })} /><Btn kind="danger" onClick={() => confirm('Hapus acara ini?') && set((c) => { c.events.splice(i, 1); })}><Trash2 size={14} /></Btn></span>}>
              <div className="grid md:grid-cols-2 gap-4">
                <F label="Nama acara"><T v={e.title} on={(v) => set((c) => { c.events[i].title = v; })} /></F>
                <F label="Tanggal"><input type="date" className={inp} value={e.date} onChange={(ev) => set((c) => { c.events[i].date = ev.target.value; })} /></F>
                <F label="Mulai"><input type="time" className={inp} value={e.start} onChange={(ev) => set((c) => { c.events[i].start = ev.target.value; })} /></F>
                <F label="Selesai"><input type="time" className={inp} value={e.end} onChange={(ev) => set((c) => { c.events[i].end = ev.target.value; })} /></F>
                <F label="Zona waktu"><select className={inp} value={e.tz} onChange={(ev) => set((c) => { c.events[i].tz = ev.target.value as EventItem['tz']; })}><option>WIB</option><option>WITA</option><option>WIT</option></select></F>
                <F label="Nama tempat"><T v={e.venue} on={(v) => set((c) => { c.events[i].venue = v; })} /></F>
                <div className="md:col-span-2"><F label="Alamat lengkap"><TA v={e.address} on={(v) => set((c) => { c.events[i].address = v; })} rows={2} /></F></div>
                <div className="md:col-span-2"><F label="Tautan Google Maps (https://…)" hint="Salin dari tombol Bagikan di Google Maps"><T v={e.mapsUrl} on={(v) => set((c) => { c.events[i].mapsUrl = v; })} /></F></div>
              </div>
            </Card>
          ))}
          <Btn kind="ghost" onClick={() => set((c) => { c.events.push({ id: uid(), title: 'Acara Baru', date: wDate, start: '09:00', end: '11:00', tz: 'WIB', venue: '', address: '', mapsUrl: '' } as EventItem); })}><Plus size={15} />Tambah acara</Btn>
        </>)}
        {tab === 'story' && (<>
          {cfg.story.map((s, i) => (
            <Card key={s.id} title={`Momen ${i + 1}`} action={<span className="flex gap-1"><Move i={i} len={cfg.story.length} move={(a, b) => set((c) => { c.story = reorder(c.story, a, b); })} /><Btn kind="danger" onClick={() => set((c) => { c.story.splice(i, 1); })}><Trash2 size={14} /></Btn></span>}>
              <div className="grid md:grid-cols-2 gap-4"><F label="Waktu"><T v={s.date} on={(v) => set((c) => { c.story[i].date = v; })} /></F><F label="Judul"><T v={s.title} on={(v) => set((c) => { c.story[i].title = v; })} /></F>
                <div className="md:col-span-2"><F label="Cerita"><TA v={s.text} on={(v) => set((c) => { c.story[i].text = v; })} /></F></div></div>
            </Card>
          ))}
          <Btn kind="ghost" onClick={() => set((c) => { c.story.push({ id: uid(), date: '', title: 'Momen Baru', text: '' } as StoryItem); })}><Plus size={15} />Tambah momen</Btn>
        </>)}
        {tab === 'gallery' && (
          <Card title={`Galeri (${cfg.gallery.length} foto)`} action={<label className="cursor-pointer"><span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 text-white px-3 py-2 text-sm"><Upload size={15} />Unggah foto</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const fs = Array.from(e.target.files || []); e.target.value = ''; for (const f of fs) { try { const u = await upload(f); setCfg((c) => c && ({ ...c, gallery: [...c.gallery, { id: uid(), src: u.src, thumb: u.thumb || u.src, alt: f.name.replace(/\.\w+$/, '') } as GalleryItem] })); setDirty(true); } catch (x) { setNote({ t: 'err', m: (x as Error).message }); } } }} /></label>}>
            <p className="text-xs text-stone-500 mb-3">Foto otomatis dikompres ke WebP (maks. 1400px) + thumbnail. Klik Simpan setelah selesai.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{cfg.gallery.map((g, i) => (
              <div key={g.id} className="rounded-xl border overflow-hidden bg-stone-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.thumb || g.src} alt="" className="w-full aspect-square object-cover" />
                <div className="p-2 space-y-2"><input className={inp} value={g.alt} onChange={(e) => set((c) => { c.gallery[i].alt = e.target.value; })} aria-label="Keterangan" />
                  <div className="flex justify-between"><Move i={i} len={cfg.gallery.length} move={(a, b) => set((c) => { c.gallery = reorder(c.gallery, a, b); })} /><Btn kind="danger" onClick={() => set((c) => { c.gallery.splice(i, 1); })}><Trash2 size={14} /></Btn></div></div>
              </div>))}</div>
          </Card>
        )}
        {tab === 'music' && (
          <Card title="Musik latar">
            <div className="grid gap-4">
              <F label="Judul lagu"><T v={cfg.music.title} on={(v) => set((c) => { c.music.title = v; })} /></F>
              <F label="File saat ini"><p className="text-sm text-stone-600 break-all">{cfg.music.src}</p></F>
              <audio controls src={cfg.music.src} className="w-full" preload="none" />
              <label className="cursor-pointer w-fit"><span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-2 text-sm"><Upload size={15} />Ganti lagu (mp3/m4a, maks. 4 MB)</span>
                <input type="file" accept="audio/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const u = await upload(f, 'audio'); set((c) => { c.music.src = u.src; c.music.title = f.name.replace(/\.\w+$/, ''); }); } catch (x) { setNote({ t: 'err', m: (x as Error).message }); } e.target.value = ''; }} /></label>
            </div>
          </Card>
        )}
        {tab === 'theme' && (<>
          <Card title="Preset warna"><div className="flex flex-wrap gap-2">{Object.entries(PRESETS).map(([n, p]) => <Btn key={n} kind="ghost" onClick={() => set((c) => { c.theme = { ...p }; })}><span className="flex">{(['gold', 'sage', 'cream'] as const).map((k) => <i key={k} className="w-3.5 h-3.5 rounded-full border border-white -ml-1 first:ml-0" style={{ background: toHex(p[k]) }} />)}</span>{n}</Btn>)}</div></Card>
          <Card title="Warna kustom"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{([['gold', 'Emas'], ['goldDeep', 'Emas tua / aksen'], ['sage', 'Sage'], ['sageDeep', 'Sage tua'], ['cream', 'Krem (latar)'], ['creamDeep', 'Krem tua'], ['ink', 'Teks']] as const).map(([k, l]) => <F key={k} label={l}><input type="color" className="w-full h-10 rounded-lg border" value={toHex(cfg.theme[k])} onChange={(e) => set((c) => { c.theme[k] = fromHex(e.target.value); })} /></F>)}</div>
            <p className="text-xs text-stone-500 mt-3">Ornamen bergambar (emas/hijau) tetap berwarna asli; warna ini memengaruhi latar, teks, tombol, dan kartu.</p></Card>
        </>)}
        {tab === 'rsvp' && <RsvpTab />}
        {tab === 'wishes' && <WishesTab />}
        {tab === 'gift' && (<>
          <Card title="Rekening bank">
            {cfg.gift.banks.map((b, i) => (
              <div key={b.id} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-3 items-end">
                <F label="Bank"><T v={b.bank} on={(v) => set((c) => { c.gift.banks[i].bank = v; })} /></F><F label="Nama pemilik"><T v={b.name} on={(v) => set((c) => { c.gift.banks[i].name = v; })} /></F>
                <F label="Nomor rekening"><T v={b.number} on={(v) => set((c) => { c.gift.banks[i].number = v; })} /></F><Btn kind="danger" onClick={() => set((c) => { c.gift.banks.splice(i, 1); })}><Trash2 size={14} /></Btn>
              </div>))}
            <Btn kind="ghost" onClick={() => set((c) => { c.gift.banks.push({ id: uid(), bank: '', name: '', number: '' } as BankItem); })}><Plus size={15} />Tambah rekening</Btn>
          </Card>
          <Card title="QRIS & alamat hadiah">
            <div className="grid gap-4">
              <ImageField label="Gambar QRIS (opsional)" value={cfg.gift.qris} onChange={(v) => set((c) => { c.gift.qris = v; })} />
              <F label="Nama penerima"><T v={cfg.gift.addressRecipient} on={(v) => set((c) => { c.gift.addressRecipient = v; })} /></F>
              <F label="Alamat pengiriman hadiah (kosongkan untuk menyembunyikan)"><TA v={cfg.gift.address} on={(v) => set((c) => { c.gift.address = v; })} /></F>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.gift.confirmEnabled} onChange={(e) => set((c) => { c.gift.confirmEnabled = e.target.checked; })} />Aktifkan tombol konfirmasi pengiriman hadiah</label>
            </div>
          </Card>
          <GiftConfirms />
        </>)}
        {tab === 'links' && <LinksTab slug={cfg.slug} wedding={cfg.weddingDate} />}
      </main>

      {(dirty || note) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-stone-900 text-white pl-5 pr-2 py-2 shadow-2xl">
          <span className="text-sm">{note ? <span className={note.t === 'err' ? 'text-red-300' : 'text-green-300'}>{note.m}</span> : 'Ada perubahan belum disimpan'}</span>
          {dirty && <Btn onClick={save} disabled={saving}><Save size={15} />{saving ? 'Menyimpan…' : 'Simpan'}</Btn>}
        </div>
      )}
    </div>
  );
}
