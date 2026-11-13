'use client';
import { motion } from 'framer-motion';
import type { Person, SiteConfig } from '@/lib/types';
import { FlowerEdge, Orn, Reveal, Section, SectionTitle } from '../ui';

function PersonCard({ p, side }: { p: Person; side: 'left' | 'right' }) {
  return (
    <Reveal v={side} className="text-center flex flex-col items-center">
      <motion.div className="relative w-[64vw] max-w-[260px]" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div className="absolute -inset-2 rounded-t-full border border-gold/50" />
        <div className="absolute -inset-4 rounded-t-full border border-gold/25" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-2xl bg-creamDeep shadow-xl ring-1 ring-gold/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[1500ms] hover:scale-110" />
        </div>
        <Orn name="f2" className="absolute -bottom-5 -left-6 w-14 anim-floaty" />
        <Orn name="f5" className="absolute -top-1 -right-7 w-10 anim-floaty" style={{ animationDelay: '-2s' }} />
        <Orn name="daun" className="absolute -bottom-6 -right-8 w-20 anim-sway" />
      </motion.div>
      <h3 className="font-script text-4xl gold-text mt-9 leading-tight">{p.name}</h3>
      <p className="text-sm text-ink/60 mt-1">{p.childOrder}</p>
      <p className="font-serif text-lg mt-1 leading-snug">{p.father}<br />&amp; {p.mother}</p>
    </Reveal>
  );
}

export default function Profile({ config }: { config: SiteConfig }) {
  const { groom, bride, description, quote } = config.couple;
  return (
    <>
      <Section id="ayat" className="paper-sage !py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal v="zoom"><Orn name="cloud1" className="w-24 mx-auto anim-drift" /></Reveal>
          {quote.arab && <Reveal v="blur" delay={0.1}><p dir="rtl" lang="ar" className="font-arab text-2xl md:text-3xl leading-[2.1] mt-6 text-sageDeep">{quote.arab}</p></Reveal>}
          <Reveal delay={0.2}><p className="font-serif italic text-[17px] md:text-lg leading-relaxed mt-5 text-ink/85">“{quote.text}”</p></Reveal>
          <Reveal delay={0.3}><p className="mt-4 font-medium tracking-widest text-xs uppercase text-goldDeep">{quote.source}</p></Reveal>
        </div>
      </Section>

      <Section id="mempelai" className="paper">
        <SectionTitle eyebrow="Bismillahirrahmanirrahim" title="Mempelai" sub={description} />
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-14 md:gap-8 items-start pb-40 md:pb-48">
          <PersonCard p={groom} side="left" />
          <Reveal v="zoom" delay={0.3} className="self-center text-center">
            <motion.span className="font-script text-6xl gold-text inline-block" animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}>&amp;</motion.span>
          </Reveal>
          <PersonCard p={bride} side="right" />
        </div>
        <FlowerEdge />
      </Section>
    </>
  );
}
