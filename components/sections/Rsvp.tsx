'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { validateRsvp, LIMITS } from '@/lib/validate';
import { Orn, Reveal, Section, SectionTitle } from '../ui';

const KEY = 'rsvp_done';
export default function Rsvp({ guest, onToast }: { guest: string; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [name, setName] = useState(guest);
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<0 | 1 | null>(null);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState('');
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | 0 | 1>(null);
  const t0 = useRef(Date.now());
  useEffect(() => { try { const v = localStorage.getItem(KEY); if (v) setDone(v === '1' ? 1 : 0); } catch {} }, []);
  useEffect(() => { if (guest) setName(guest); }, [guest]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = validateRsvp({ name, phone, attending: attending ?? undefined, guests, note });
    setErrors(r.errors);
    if (!r.ok) { onToast('Mohon lengkapi isian yang ditandai', 'err'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r.value, website: hp, t: t0.current }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { if (data.fields) setErrors(data.fields); onToast(data.error || 'Gagal mengirim', 'err'); return; }
      setDone(r.value.attending as 0 | 1);
      try { localStorage.setItem(KEY, String(r.value.attending)); } catch {}
      onToast('Konfirmasi kehadiran terkirim. Terima kasih!');
    } catch { onToast('Koneksi bermasalah, coba lagi', 'err'); } finally { setBusy(false); }
  }
  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="text-[13px] text-[#a8453b] mt-1">{errors[k]}</p> : null);

  return (
    <Section id="rsvp" className="paper-sage">
      <Orn name="sudut" className="absolute left-0 bottom-0 w-32 opacity-70 -scale-x-100" />
      <SectionTitle eyebrow="Konfirmasi Kehadiran" title="RSVP" sub="Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir. Mohon konfirmasi kehadiran Anda." />
      <Reveal v="rise" className="max-w-md mx-auto">
        <div className="card-gold p-6 md:p-8 relative overflow-hidden">
          <Orn name="sudut" className="absolute -right-1 -bottom-1 w-24 opacity-70" />
          <AnimatePresence mode="wait" initial={false}>
            {done !== null ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 relative">
                <motion.div className="w-20 h-20 mx-auto rounded-full bg-sageDeep text-white flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                  <Check size={40} strokeWidth={3} />
                </motion.div>
                <h3 className="font-script text-4xl gold-text mt-5">Terima Kasih</h3>
                <p className="text-ink/75 mt-2">{done === 1 ? 'Konfirmasi kehadiran Anda telah kami terima. Sampai jumpa di hari bahagia kami!' : 'Terima kasih telah memberi kabar. Doa Anda sangat berarti bagi kami.'}</p>
                <button className="btn-ghost mt-5" onClick={() => { try { localStorage.removeItem(KEY); } catch {} setDone(null); setAttending(null); }}>Ubah konfirmasi</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate className="grid gap-4 relative" exit={{ opacity: 0 }}>
                <input tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" className="absolute opacity-0 pointer-events-none h-0 w-0" />
                <div>
                  <label htmlFor="r-name" className="text-sm font-medium">Nama <span className="text-[#a8453b]">*</span></label>
                  <input id="r-name" className="field mt-1" value={name} maxLength={LIMITS.name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" aria-invalid={!!errors.name} autoComplete="name" />
                  <Err k="name" />
                </div>
                <div>
                  <label htmlFor="r-wa" className="text-sm font-medium">Nomor WhatsApp <span className="text-ink/50 font-normal">(opsional)</span></label>
                  <input id="r-wa" className="field mt-1" inputMode="tel" value={phone} maxLength={LIMITS.phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxxx" aria-invalid={!!errors.phone} autoComplete="tel" />
                  <Err k="phone" />
                </div>
                <fieldset>
                  <legend className="text-sm font-medium">Konfirmasi kehadiran <span className="text-[#a8453b]">*</span></legend>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {([[1, 'Hadir'], [0, 'Tidak Hadir']] as const).map(([v, l]) => (
                      <motion.button key={v} type="button" whileTap={{ scale: 0.95 }} onClick={() => setAttending(v)} aria-pressed={attending === v}
                        className={`relative rounded-xl py-3 border text-sm font-medium transition-colors ${attending === v ? 'bg-sageDeep text-white border-sageDeep' : 'bg-white/70 border-gold/40 hover:bg-white'}`}>
                        {attending === v && <motion.span layoutId="rsvp-pick" className="absolute inset-0 rounded-xl ring-2 ring-sageDeep ring-offset-2 ring-offset-cream" />}
                        <span className="relative">{l}</span>
                      </motion.button>
                    ))}
                  </div>
                  <Err k="attending" />
                </fieldset>
                <AnimatePresence initial={false}>
                  {attending === 1 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <label className="text-sm font-medium">Jumlah tamu yang hadir</label>
                      <div className="flex items-center gap-4 mt-1">
                        <button type="button" aria-label="Kurangi" className="w-11 h-11 rounded-full border border-gold/50 bg-white/70 flex items-center justify-center active:scale-90 transition" onClick={() => setGuests((g) => Math.max(1, g - 1))}><Minus size={16} /></button>
                        <motion.span key={guests} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-serif text-3xl w-10 text-center" aria-live="polite">{guests}</motion.span>
                        <button type="button" aria-label="Tambah" className="w-11 h-11 rounded-full border border-gold/50 bg-white/70 flex items-center justify-center active:scale-90 transition" onClick={() => setGuests((g) => Math.min(LIMITS.maxGuests, g + 1))}><Plus size={16} /></button>
                        <span className="text-sm text-ink/60">orang</span>
                      </div>
                      <Err k="guests" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <label htmlFor="r-note" className="text-sm font-medium">Catatan <span className="text-ink/50 font-normal">(opsional)</span></label>
                  <textarea id="r-note" className="field mt-1 min-h-[84px]" rows={3} value={note} maxLength={LIMITS.note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. alergi makanan, kebutuhan khusus…" />
                </div>
                <motion.button type="submit" disabled={busy} className="btn-gold !py-3.5 mt-1" whileTap={{ scale: 0.96 }}>
                  {busy ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white" /> : <Send size={17} />}
                  {busy ? 'Mengirim…' : 'Kirim Konfirmasi'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}
