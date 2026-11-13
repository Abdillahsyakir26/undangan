'use client';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, Gift, Heart, Home, Image as ImageIcon, MessageCircle, Plus, Share2, ArrowUp, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

const ITEMS = [
  { id: 'beranda', label: 'Beranda', Icon: Home },
  { id: 'mempelai', label: 'Mempelai', Icon: Heart },
  { id: 'acara', label: 'Acara', Icon: CalendarDays },
  { id: 'galeri', label: 'Galeri', Icon: ImageIcon },
  { id: 'ucapan', label: 'Ucapan', Icon: MessageCircle },
  { id: 'hadiah', label: 'Hadiah', Icon: Gift },
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden className="fixed top-0 left-0 right-0 h-[3px] z-[80] origin-left bg-gradient-to-r from-gold via-[#e0b878] to-goldDeep" style={{ scaleX }} />;
}

export function FloatNav() {
  const [active, setActive] = useState('beranda');
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 120);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    ITEMS.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.nav aria-label="Navigasi bagian" initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[96vw] z-[60] flex gap-0.5 p-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-2xl border border-gold/30">
          {ITEMS.map(({ id, label, Icon }) => (
            <a key={id} href={`#${id}`} aria-label={label} aria-current={active === id} className="relative w-11 h-11 rounded-full flex items-center justify-center">
              {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-goldDeep" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <Icon size={18} className={`relative ${active === id ? 'text-white' : 'text-goldDeep'}`} />
            </a>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export function SpeedDial({ whatsapp, title, text }: { whatsapp: string; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (!open) return;
    const f = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('[data-dial]')) setOpen(false); };
    document.addEventListener('click', f); return () => document.removeEventListener('click', f);
  }, [open]);
  async function share() {
    const url = location.origin + location.pathname; // tanpa nama tamu
    if (navigator.share) { try { await navigator.share({ title, text, url }); } catch {} }
    else { window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener'); }
    setOpen(false);
  }
  const actions = [
    { key: 'top', label: 'Kembali ke atas', Icon: ArrowUp, onClick: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setOpen(false); } },
    { key: 'share', label: 'Bagikan undangan', Icon: Share2, onClick: share },
    { key: 'wa', label: 'Hubungi via WhatsApp', Icon: MessageSquare, href: `https://wa.me/${whatsapp}?text=${encodeURIComponent('Halo, saya ingin bertanya terkait undangan pernikahan.')}` },
  ];
  return (
    <div data-dial className="fixed right-3 bottom-[88px] z-[60] flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {open && actions.map((a, i) => {
          const cls = 'flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-white/95 shadow-lg border border-gold/30 text-[12px] font-medium';
          const inner = (<><span>{a.label}</span><span className="w-9 h-9 rounded-full bg-gold/15 text-goldDeep flex items-center justify-center"><a.Icon size={16} /></span></>);
          return (
            <motion.div key={a.key} initial={{ opacity: 0, y: 16, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.05 } }} exit={{ opacity: 0, y: 10, scale: 0.8, transition: { delay: (actions.length - i) * 0.03 } }}>
              {a.href ? <a className={cls} href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a> : <button className={cls} onClick={a.onClick}>{inner}</button>}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <motion.button aria-label="Menu aksi" aria-expanded={open} whileTap={{ scale: 0.9 }} onClick={() => setOpen((v) => !v)} className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-xl"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgb(214 170 100), rgb(var(--c-gold-deep)))' }}>
        <motion.span animate={{ rotate: open ? 135 : 0 }}><Plus size={22} /></motion.span>
      </motion.button>
    </div>
  );
}
