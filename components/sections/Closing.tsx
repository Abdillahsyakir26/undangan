'use client';
import { motion } from 'framer-motion';
import { ArrowUp, Heart } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';
import { dateShort } from '@/lib/format';
import { Orn, Reveal, Section } from '../ui';
import Petals from '../Petals';

export default function Closing({ config }: { config: SiteConfig }) {
  const { groom, bride } = config.couple;
  return (
    <section id="penutup" className="relative paper overflow-hidden pt-24 text-center">
      <Orn name="gunungan" className="absolute left-1/2 top-[8%] -translate-x-1/2 h-[70%] opacity-[.06]" />
      <Orn name="lantern1" className="absolute left-[6%] top-0 h-[16%] anim-swing anim-glow" />
      <Orn name="lantern2" className="absolute right-[7%] top-0 h-[20%] anim-swing anim-glow" style={{ animationDelay: '-2s' }} />
      <Petals count={12} />
      <div className="relative z-10 px-6 max-w-xl mx-auto">
        <Reveal v="zoom"><Orn name="gapura" className="w-40 mx-auto opacity-95" /></Reveal>
        <Reveal v="blur" delay={0.1}><h2 className="font-script text-5xl gold-text mt-4">Terima Kasih</h2></Reveal>
        <Reveal delay={0.2}><p className="mt-4 text-[15px] leading-relaxed text-ink/80">{config.closing.thanks}</p></Reveal>
        <Reveal delay={0.3}><p className="mt-5 font-serif italic text-lg text-ink/85 leading-relaxed">{config.closing.doa}</p></Reveal>
        <Reveal v="zoom" delay={0.35} className="my-8 flex items-center justify-center gap-3 text-gold"><span className="h-px w-14 bg-gold/50" /><Heart size={16} fill="currentColor" /><span className="h-px w-14 bg-gold/50" /></Reveal>
        <Reveal><p className="text-[15px] text-ink/70 italic">“{config.closing.quote}”</p></Reveal>
        <Reveal v="blur" delay={0.15}>
          <p className="mt-8 text-xs tracking-[.35em] uppercase text-sageDeep">Kami yang berbahagia</p>
          <p className="font-script gold-text text-[clamp(3rem,13vw,4.8rem)] leading-tight mt-1">{groom.nick} &amp; {bride.nick}</p>
          <p className="font-serif text-lg tracking-[.2em] text-ink/60 mt-1">{dateShort(config.weddingDate)}</p>
        </Reveal>
        <Reveal v="zoom" className="mt-9">
          <motion.a href="#beranda" className="btn-gold" whileHover={{ y: -3 }} whileTap={{ scale: 0.94 }}><ArrowUp size={17} /> Kembali ke atas</motion.a>
        </Reveal>
      </div>
      <div className="relative mt-14 h-40 md:h-56">
        <Orn name="semak1" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] max-w-[900px] anim-sway" />
        <Orn name="buket3" className="absolute bottom-0 left-[-6%] w-40 md:w-56 anim-sway" />
        <Orn name="bunga_semak" className="absolute bottom-0 right-[-6%] w-40 md:w-56 anim-sway" style={{ animationDelay: '-3s' }} />
      </div>
      <footer className="relative z-10 bg-sageDeep text-cream/90 text-xs py-4 tracking-wider">
        © {groom.nick} &amp; {bride.nick} · {dateShort(config.weddingDate)} · Dibuat dengan <Heart size={11} className="inline -mt-0.5" fill="currentColor" />
      </footer>
    </section>
  );
}
