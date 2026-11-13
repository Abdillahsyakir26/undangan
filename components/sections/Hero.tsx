'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import type { SiteConfig } from '@/lib/types';
import { dateLong } from '@/lib/format';
import { Orn } from '../ui';
import Petals from '../Petals';

export default function Hero({ config, guest }: { config: SiteConfig; guest: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yCloud1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yCloud2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yGun = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { groom, bride } = config.couple;
  return (
    <section id="beranda" ref={ref} className="paper relative min-h-dvh flex items-center justify-center text-center overflow-hidden px-6 scroll-mt-0">
      {config.coverPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      )}
      <motion.div style={{ y: yGun }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Orn name="gunungan" className="h-[80dvh] opacity-[.06]" />
      </motion.div>
      <motion.div style={{ y: yCloud1 }} className="absolute top-[14%] left-[-6%]"><Orn name="cloud1" className="w-40 md:w-64 opacity-90 anim-drift" /></motion.div>
      <motion.div style={{ y: yCloud2 }} className="absolute top-[40%] right-[-8%]"><Orn name="cloud2" className="w-32 md:w-52 opacity-85 anim-drift" style={{ animationDelay: '-6s' }} /></motion.div>
      <motion.div style={{ y: yCloud2 }} className="absolute bottom-[26%] left-[-4%]"><Orn name="cloud3" className="w-24 md:w-40 opacity-80 anim-drift" style={{ animationDelay: '-3s' }} /></motion.div>
      <Orn name="lantern1" className="absolute left-[7%] top-0 h-[20dvh] md:h-[28dvh] anim-swing anim-glow" />
      <Orn name="lantern2" className="absolute right-[8%] top-0 h-[26dvh] md:h-[36dvh] anim-swing anim-glow" style={{ animationDelay: '-2.5s' }} />
      <Orn name="sudut" className="absolute right-0 bottom-0 w-[34vw] max-w-[260px] opacity-90" />
      <Orn name="sudut" className="absolute left-0 top-0 w-[26vw] max-w-[190px] opacity-80 rotate-180" />
      <Petals count={16} />

      <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 max-w-xl">
        <motion.p className="tracking-[.4em] uppercase text-xs text-sageDeep font-medium" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}>The Wedding Of</motion.p>
        <motion.h1 className="font-script gold-text leading-[1.1] my-3 text-[clamp(3.4rem,15vw,6.5rem)]" initial={{ opacity: 0, filter: 'blur(14px)', scale: 0.9 }} animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} transition={{ delay: 0.45, duration: 1.3 }}>
          {groom.nick}<br /><span className="text-[.55em] text-ink/60 font-serif italic">&amp;</span><br />{bride.nick}
        </motion.h1>
        <motion.div className="flex items-center justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <span className="h-px w-12 bg-gold/60" /><p className="font-serif text-xl tracking-wide">{dateLong(config.weddingDate)}</p><span className="h-px w-12 bg-gold/60" />
        </motion.div>
        <motion.p className="mt-6 text-sm text-ink/70 max-w-sm mx-auto leading-relaxed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          {guest ? <>Kepada Yth. <b className="font-semibold">{guest}</b>, k</> : 'K'}ami mengundang Anda untuk hadir dan memberikan doa restu di hari bahagia kami.
        </motion.p>
      </motion.div>
      <motion.a href="#mempelai" aria-label="Gulir ke bawah" className="absolute bottom-24 left-1/2 -translate-x-1/2 text-goldDeep z-10" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        <ChevronDown size={30} />
      </motion.a>
    </section>
  );
}
