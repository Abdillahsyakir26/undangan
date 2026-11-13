'use client';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { SiteConfig } from '@/lib/types';
import { Orn, Section, SectionTitle } from '../ui';

function Thumb({ src, alt, i, onClick }: { src: string; alt: string; i: number; onClick: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <motion.button type="button" onClick={onClick} aria-label={`Perbesar ${alt}`} className="block w-full mb-3 md:mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-creamDeep ring-1 ring-gold/30 shadow-md relative group"
      initial={{ opacity: 0, y: 50, scale: 0.94, filter: 'blur(10px)' }} whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={() => setOk(true)} className={`w-full h-auto block transition-all duration-[900ms] group-hover:scale-105 ${ok ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`} />
      <span className="absolute inset-0 bg-gradient-to-t from-goldDeep/30 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

export default function Gallery({ config }: { config: SiteConfig }) {
  const items = config.gallery;
  const [idx, setIdx] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const go = useCallback((d: number) => { setDir(d); setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)); }, [items.length]);
  useEffect(() => {
    if (idx === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setIdx(null); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', k);
    const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    // preload tetangga
    [1, -1].forEach((d) => { const im = new Image(); im.src = items[(idx + d + items.length) % items.length].src; });
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prevOverflow; };
  }, [idx, go, items]);
  const onDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1); };

  return (
    <Section id="galeri" className="paper">
      <Orn name="buket3" className="absolute -left-14 top-12 w-56 opacity-60 anim-sway hidden md:block" />
      <SectionTitle eyebrow="Momen Berharga" title="Galeri Foto" />
      <div className="max-w-4xl mx-auto columns-2 md:columns-3 gap-3 md:gap-4">
        {items.map((g, i) => <Thumb key={g.id} src={g.thumb || g.src} alt={g.alt} i={i} onClick={() => { setDir(1); setIdx(i); }} />)}
      </div>

      <AnimatePresence>
        {idx !== null && (
          <motion.div className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Lightbox foto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIdx(null)}>
            <button aria-label="Tutup" className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25" onClick={() => setIdx(null)}><X /></button>
            <span className="absolute top-5 left-5 text-white/80 text-sm tracking-widest">{idx + 1} / {items.length}</span>
            <button aria-label="Sebelumnya" className="absolute left-2 md:left-6 z-10 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft /></button>
            <button aria-label="Berikutnya" className="absolute right-2 md:right-6 z-10 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight /></button>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.img key={items[idx].id} src={items[idx].src} alt={items[idx].alt} custom={dir} draggable={false}
                className="max-w-[92vw] max-h-[86dvh] object-contain rounded-lg shadow-2xl select-none cursor-grab active:cursor-grabbing"
                variants={{ enter: (d: number) => ({ x: d * 80, opacity: 0, scale: 0.94 }), center: { x: 0, opacity: 1, scale: 1 }, exit: (d: number) => ({ x: -d * 80, opacity: 0, scale: 0.94 }) }}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5} onDragEnd={onDragEnd} onClick={(e) => e.stopPropagation()} />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
