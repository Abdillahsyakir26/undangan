'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleHeart, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Wish } from '@/lib/types';
import { dateTimeId, initials, timeAgo } from '@/lib/format';
import { LIMITS, validateWish } from '@/lib/validate';
import { Orn, Reveal, Section, SectionTitle } from '../ui';

export default function Wishes({ guest, onToast }: { guest: string; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [name, setName] = useState(guest);
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Wish[]>([]);
  const [total, setTotal] = useState(0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const t0 = useRef(Date.now());
  useEffect(() => { if (guest) setName(guest); }, [guest]);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(id); }, []);

  const load = useCallback(async (before?: number) => {
    const r = await fetch(`/api/wishes?limit=8${before ? `&before=${before}` : ''}`, { cache: 'no-store' });
    const d = await r.json();
    setItems((p) => (before ? [...p, ...d.items] : d.items)); setMore(d.hasMore); setTotal(d.total);
  }, []);
  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = validateWish({ name, message });
    setErrors(r.errors);
    if (!r.ok) return;
    setBusy(true);
    try {
      const res = await fetch('/api/wishes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r.value, website: hp, t: t0.current }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { if (d.fields) setErrors(d.fields); onToast(d.error || 'Gagal mengirim ucapan', 'err'); return; }
      if (d.item) { setItems((p) => [d.item, ...p]); setTotal((t) => t + 1); }
      setMessage(''); t0.current = Date.now();
      onToast('Ucapan terkirim. Terima kasih atas doanya!');
    } catch { onToast('Koneksi bermasalah, coba lagi', 'err'); } finally { setBusy(false); }
  }

  return (
    <Section id="ucapan" className="paper">
      <Orn name="buket2" className="absolute -right-12 top-16 w-48 opacity-60 anim-sway hidden md:block" />
      <SectionTitle eyebrow="Doa & Harapan" title="Ucapan" sub="Kirimkan ucapan dan doa terbaik Anda untuk kedua mempelai." />
      <div className="max-w-xl mx-auto">
        <Reveal v="rise">
          <form onSubmit={submit} noValidate className="card-gold p-6 grid gap-4 relative">
            <input tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" className="absolute opacity-0 pointer-events-none h-0 w-0" />
            <div>
              <label htmlFor="w-name" className="text-sm font-medium">Nama</label>
              <input id="w-name" className="field mt-1" value={name} maxLength={LIMITS.name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" aria-invalid={!!errors.name} />
              {errors.name && <p role="alert" className="text-[13px] text-[#a8453b] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="w-msg" className="text-sm font-medium">Ucapan & doa</label>
              <textarea id="w-msg" className="field mt-1 min-h-[110px]" rows={4} value={message} maxLength={LIMITS.message} onChange={(e) => setMessage(e.target.value)} placeholder="Tuliskan ucapan dan doa…" aria-invalid={!!errors.message} />
              <div className="flex justify-between text-[13px] mt-1"><span role="alert" className="text-[#a8453b]">{errors.message}</span><span className="text-ink/50">{message.length}/{LIMITS.message}</span></div>
            </div>
            <motion.button type="submit" disabled={busy} className="btn-gold !py-3.5" whileTap={{ scale: 0.96 }}><Send size={17} />{busy ? 'Mengirim…' : 'Kirim Ucapan'}</motion.button>
          </form>
        </Reveal>

        <div className="mt-10">
          <p className="flex items-center gap-2 font-serif text-xl mb-4"><MessageCircleHeart className="text-gold" size={22} /> {total} Ucapan</p>
          {loading && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-gold/10 animate-pulse" />)}</div>}
          {!loading && items.length === 0 && <p className="text-center text-ink/60 py-8">Jadilah yang pertama mengirim ucapan ✨</p>}
          <ul className="space-y-3 max-h-[560px] overflow-y-auto pr-1 -mr-1 overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence initial={false}>
              {items.map((w) => (
                <motion.li layout key={w.id} initial={{ opacity: 0, y: -24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="card-gold !rounded-2xl p-4 flex gap-3">
                  <span className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-gold to-goldDeep text-white flex items-center justify-center font-semibold text-sm">{initials(w.name)}</span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight truncate">{w.name}</p>
                    <p className="text-[11px] text-ink/50" title={dateTimeId(w.created_at)}>{dateTimeId(w.created_at)}{now ? ` · ${timeAgo(w.created_at, now)}` : ''}</p>
                    <p className="text-[15px] text-ink/80 mt-1.5 whitespace-pre-line break-words">{w.message}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {more && <button className="btn-ghost mx-auto mt-4 flex" onClick={() => load(items[items.length - 1]?.id)}>Muat lebih banyak</button>}
        </div>
      </div>
    </Section>
  );
}
