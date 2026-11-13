'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Gift as GiftIcon, PackageCheck, QrCode } from 'lucide-react';
import { useState } from 'react';
import type { SiteConfig } from '@/lib/types';
import { Orn, Reveal, Section, SectionTitle, stagger, itemUp } from '../ui';

async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
  }
}
function CopyBtn({ text, label, onToast }: { text: string; label: string; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [ok, setOk] = useState(false);
  return (
    <motion.button whileTap={{ scale: 0.92 }} className="btn-gold !py-2 !px-4 !text-[13px]" onClick={async () => { if (await copyText(text)) { setOk(true); onToast(`${label} disalin`); setTimeout(() => setOk(false), 2000); } else onToast('Gagal menyalin', 'err'); }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={String(ok)} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="inline-flex">{ok ? <Check size={15} /> : <Copy size={15} />}</motion.span>
      </AnimatePresence>
      {ok ? 'Tersalin' : 'Salin'}
    </motion.button>
  );
}

export default function Gift({ config, guest, onToast }: { config: SiteConfig; guest: string; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const g = config.gift;
  const [qris, setQris] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState(guest);
  const [detail, setDetail] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { onToast('Isi nama pengirim', 'err'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, detail, website: hp }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { onToast(d.error || 'Gagal mengirim', 'err'); return; }
      setSent(true); onToast('Konfirmasi hadiah terkirim. Terima kasih!');
    } catch { onToast('Koneksi bermasalah', 'err'); } finally { setBusy(false); }
  }

  return (
    <Section id="hadiah" className="paper-deep">
      <Orn name="buket1" className="absolute -left-10 top-10 w-44 opacity-60 anim-sway hidden md:block" />
      <SectionTitle eyebrow="Tanda Kasih" title="Amplop Digital" sub="Doa restu Anda adalah hadiah terbaik bagi kami. Namun jika berkenan memberi tanda kasih, dapat melalui:" />
      <motion.div className="max-w-md mx-auto grid gap-5" variants={stagger(0.15)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
        {g.banks.map((b) => (
          <motion.div key={b.id} variants={itemUp} whileHover={{ y: -4, rotate: -0.4 }} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgb(var(--c-gold)), rgb(var(--c-gold-deep)) 70%, rgb(110 74 36))' }}>
            <Orn name="sudut" className="absolute -right-3 -bottom-3 w-32 opacity-25" />
            <div className="flex items-center justify-between"><span className="font-semibold tracking-wide">{b.bank}</span><GiftIcon size={20} className="opacity-80" /></div>
            <p className="font-serif text-[28px] tracking-[.12em] mt-5 break-all">{b.number}</p>
            <p className="text-sm opacity-90 mt-1">a.n. {b.name}</p>
            <div className="mt-4 relative z-10"><CopyBtn text={b.number} label="Nomor rekening" onToast={onToast} /></div>
          </motion.div>
        ))}

        {g.qris && (
          <motion.div variants={itemUp} className="card-gold p-5 text-center">
            <button className="btn-ghost mx-auto" onClick={() => setQris((v) => !v)} aria-expanded={qris}><QrCode size={16} /> {qris ? 'Sembunyikan QRIS' : 'Tampilkan QRIS'}</button>
            <AnimatePresence initial={false}>
              {qris && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.qris} alt="QRIS" loading="lazy" className="mx-auto mt-4 w-64 max-w-full rounded-xl bg-white p-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {(g.address || g.confirmEnabled) && (
          <motion.div variants={itemUp} className="card-gold p-6 text-center">
            {g.address && (<>
              <p className="font-serif text-xl font-semibold">Kirim Hadiah</p>
              <p className="text-sm text-ink/60 mt-1">Penerima: {g.addressRecipient}</p>
              <p className="mt-2 text-[15px] leading-relaxed">{g.address}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                <CopyBtn text={`${g.addressRecipient}\n${g.address}`} label="Alamat" onToast={onToast} />
                {g.confirmEnabled && <button className="btn-ghost" onClick={() => setConfirm((v) => !v)} aria-expanded={confirm}><PackageCheck size={16} /> Konfirmasi Pengiriman</button>}
              </div>
            </>)}
            <AnimatePresence initial={false}>
              {confirm && (
                <motion.form onSubmit={send} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-left">
                  {sent ? <p className="text-center py-5 text-sageDeep font-medium">Terima kasih! Konfirmasi Anda sudah kami terima 💛</p> : (
                    <div className="grid gap-3 pt-5">
                      <input tabIndex={-1} aria-hidden autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute opacity-0 h-0 w-0 pointer-events-none" />
                      <input className="field" placeholder="Nama pengirim" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Nama pengirim" />
                      <textarea className="field" rows={2} maxLength={300} placeholder="Keterangan (mis. jasa kurir / no. resi)" value={detail} onChange={(e) => setDetail(e.target.value)} aria-label="Keterangan" />
                      <button className="btn-gold" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim Konfirmasi'}</button>
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </Section>
  );
}
