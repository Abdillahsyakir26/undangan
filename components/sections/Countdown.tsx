'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { SiteConfig } from '@/lib/types';
import { Orn, Reveal, Section, SectionTitle } from '../ui';

function Unit({ value, label }: { value: number; label: string }) {
  const s = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="card-gold !rounded-2xl w-[19vw] max-w-[96px] aspect-[4/5] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gold/25" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={s} className="font-serif text-4xl md:text-5xl font-semibold gold-text tabular-nums" initial={{ y: '-70%', opacity: 0, rotateX: 80 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: '70%', opacity: 0, rotateX: -80 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {s}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[11px] uppercase tracking-[.25em] text-ink/60">{label}</span>
    </div>
  );
}

export default function Countdown({ config }: { config: SiteConfig }) {
  const target = new Date(config.weddingDate).getTime();
  const [diff, setDiff] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => { const d = target - Date.now(); setDiff(Math.max(0, d)); return d <= 0; };
    if (tick()) return; // otomatis berhenti saat tanggal tercapai
    const id = setInterval(() => { if (tick()) clearInterval(id); }, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = diff ?? 0;
  const days = Math.floor(d / 86400000), hrs = Math.floor((d % 86400000) / 3600000), min = Math.floor((d % 3600000) / 60000), sec = Math.floor((d % 60000) / 1000);
  const done = diff !== null && diff <= 0;
  return (
    <Section id="countdown" className="paper-deep !py-20">
      <Orn name="buket1" className="absolute -left-10 bottom-0 w-52 opacity-90 anim-sway hidden md:block" />
      <Orn name="buket2" className="absolute -right-8 bottom-0 w-44 opacity-90 anim-sway hidden md:block" />
      <SectionTitle eyebrow="Menuju Hari Bahagia" title="Hitung Mundur" />
      {done ? (
        <Reveal v="zoom"><p className="text-center font-script text-5xl gold-text">Hari Bahagia Telah Tiba</p></Reveal>
      ) : (
        <Reveal v="rise" className="flex justify-center gap-2.5 md:gap-5" >
          <Unit value={days} label="Hari" /><Unit value={hrs} label="Jam" /><Unit value={min} label="Menit" /><Unit value={sec} label="Detik" />
        </Reveal>
      )}
    </Section>
  );
}
