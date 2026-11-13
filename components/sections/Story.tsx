'use client';
import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import type { SiteConfig, StoryItem } from '@/lib/types';
import { Orn, Section, SectionTitle } from '../ui';

function Item({ s, i }: { s: StoryItem; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const active = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const [open, setOpen] = useState(i === 0);
  const left = i % 2 === 0;
  return (
    <li ref={ref} className={`relative pl-14 md:pl-0 md:grid md:grid-cols-2 md:gap-14 mb-10 last:mb-0`}>
      <motion.span className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 top-5 z-10 w-9 h-9 -ml-0 rounded-full flex items-center justify-center border-2"
        animate={{ scale: active ? 1.25 : 1, backgroundColor: active ? 'rgb(184 134 74)' : 'rgb(250 243 231)', borderColor: 'rgb(184 134 74)', color: active ? '#fff' : 'rgb(184 134 74)' }}>
        <Heart size={15} fill="currentColor" />
        {active && <span className="absolute inset-0 rounded-full border border-gold" style={{ animation: 'ring 1.6s ease-out infinite' }} />}
      </motion.span>
      <motion.div className={`${left ? 'md:col-start-1 md:text-right' : 'md:col-start-2'}`}
        initial={{ opacity: 0, x: left ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <motion.button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} layout whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
          className="card-gold p-5 text-left w-full">
          <span className="inline-block px-3 py-0.5 rounded-full bg-gold/15 text-goldDeep text-xs font-medium tracking-wider">{s.date}</span>
          <h3 className="font-serif text-2xl font-semibold mt-2">{s.title}</h3>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-[15px] text-ink/75 leading-relaxed overflow-hidden mt-2">{s.text}</motion.p>
            )}
          </AnimatePresence>
          <span className="text-[11px] text-sageDeep mt-2 block md:text-inherit">{open ? 'Ketuk untuk menutup' : 'Ketuk untuk membaca'}</span>
        </motion.button>
      </motion.div>
    </li>
  );
}

export default function Story({ config }: { config: SiteConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  return (
    <Section id="cerita" className="paper-deep">
      <Orn name="daun" className="absolute -left-12 top-24 w-40 opacity-70 anim-sway" />
      <Orn name="daun" className="absolute -right-12 top-[45%] w-40 opacity-70 anim-sway -scale-x-100" />
      <SectionTitle eyebrow="Perjalanan Kami" title="Love Story" />
      <div ref={ref} className="relative max-w-3xl mx-auto">
        <div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-3 bottom-3 w-[2px] bg-gold/20 rounded" />
        <motion.div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-3 bottom-3 w-[2px] rounded bg-gradient-to-b from-gold to-goldDeep origin-top" style={{ scaleY }} />
        <ol>{config.story.map((s, i) => <Item key={s.id} s={s} i={i} />)}</ol>
      </div>
    </Section>
  );
}
