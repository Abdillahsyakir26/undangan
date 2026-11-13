'use client';
import { motion, useAnimationControls } from 'framer-motion';
import { MailOpen, Heart } from 'lucide-react';
import { useState } from 'react';
import type { SiteConfig } from '@/lib/types';
import { dateLong } from '@/lib/format';
import { Orn } from './ui';
import Petals from './Petals';

type Stage = 'idle' | 'envelope' | 'split';

function Envelope({ stage, guest }: { stage: Stage; guest: string }) {
  const open = stage !== 'idle';
  return (
    <div className="relative mx-auto" style={{ width: 'min(64vw, 250px)', aspectRatio: '1.55', perspective: 800 }}>
      {/* surat */}
      <motion.div className="absolute left-[7%] right-[7%] bottom-[8%] top-[10%] rounded-md bg-white/95 border border-gold/30 shadow flex flex-col items-center justify-center text-center px-2"
        initial={false} animate={open ? { y: '-42%', scale: 1.03 } : { y: 0, scale: 1 }} transition={{ delay: open ? 0.55 : 0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <span className="font-script text-xl gold-text leading-none">Undangan</span>
        <span className="text-[9px] tracking-widest uppercase text-ink/60 mt-1">{guest ? 'Untuk ' + guest.slice(0, 22) : 'Pernikahan'}</span>
      </motion.div>
      {/* badan amplop */}
      <div className="absolute inset-0 rounded-md shadow-lg" style={{ background: 'linear-gradient(160deg, rgb(var(--c-cream-deep)), rgb(224 200 160))', border: '1px solid rgb(var(--c-gold) / .45)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top right, transparent 49.5%, rgb(var(--c-gold) / .35) 50%, transparent 50.6%) , linear-gradient(to top left, transparent 49.5%, rgb(var(--c-gold) / .35) 50%, transparent 50.6%)', clipPath: 'polygon(0 100%, 50% 38%, 100% 100%)' }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[62%] rounded-b-md" style={{ background: 'linear-gradient(180deg, rgb(238 218 184), rgb(226 200 158))', clipPath: 'polygon(0 100%, 0 28%, 50% 0, 100% 28%, 100% 100%)', border: '1px solid rgb(var(--c-gold) / .3)' }} />
      {/* tutup (flap) */}
      <motion.div className="absolute inset-x-0 top-0 h-[58%] z-10" style={{ transformOrigin: 'top', transformStyle: 'preserve-3d' }}
        initial={false} animate={{ rotateX: open ? 180 : 0, zIndex: open ? 0 : 10 }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}>
        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'linear-gradient(180deg, rgb(244 226 194), rgb(220 190 140))', backfaceVisibility: 'hidden', filter: 'drop-shadow(0 3px 2px rgb(0 0 0 / .18))' }} />
        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'rgb(250 240 220)', transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }} />
      </motion.div>
      {/* segel */}
      <motion.div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgb(214 170 100), rgb(var(--c-gold-deep)))' }}
        animate={open ? { scale: 0, opacity: 0 } : { scale: [1, 1.08, 1] }} transition={open ? { duration: 0.3 } : { repeat: Infinity, duration: 2 }}>
        <Heart size={15} fill="currentColor" />
      </motion.div>
    </div>
  );
}

function Body({ config, guest, stage, onOpen, primary }: { config: SiteConfig; guest: string; stage: Stage; onOpen: () => void; primary: boolean }) {
  const { groom, bride } = config.couple;
  return (
    <div className="absolute top-0 h-full paper overflow-clip" style={{ width: '100vw', [primary ? 'left' : 'right']: 0 } as React.CSSProperties} aria-hidden={!primary}>
      <Petals count={10} />
      {/* sudut ukiran */}
      <Orn name="sudut" className="absolute right-0 bottom-0 w-[38vw] max-w-[220px] opacity-90" />
      <Orn name="sudut" className="absolute left-0 top-0 w-[30vw] max-w-[170px] opacity-80 rotate-180" />
      {/* lampion */}
      <Orn name="lantern1" className="absolute left-[6%] top-0 h-[17dvh] anim-swing anim-glow" />
      <Orn name="lantern2" className="absolute right-[7%] top-0 h-[22dvh] anim-swing anim-glow" style={{ animationDelay: '-2s' }} />
      <Orn name="cloud1" className="absolute left-[8%] top-[22dvh] w-24 opacity-90 anim-drift" />
      <Orn name="cloud2" className="absolute right-[4%] top-[31dvh] w-20 opacity-80 anim-drift" style={{ animationDelay: '-5s' }} />

      <div className="relative z-10 h-full flex flex-col items-center justify-between text-center px-6 pt-[6dvh] pb-[5dvh]">
        <div className="flex flex-col items-center">
          <motion.p className="tracking-[.4em] uppercase text-[11px] md:text-xs text-sageDeep font-medium" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>The Wedding Of</motion.p>
          {/* gapura + foto/inisial */}
          <motion.div className="relative mt-2" style={{ height: 'min(27dvh, 56vw)', aspectRatio: '1170/1030' }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.35, duration: 1 }}>
            {config.coverPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.coverPhoto} alt="" className="absolute object-cover" style={{ left: '33%', width: '31%', top: '45%', height: '55%', borderRadius: '999px 999px 0 0' }} />
            )}
            <Orn name="gapura" className="absolute inset-0 w-full h-full" />
            {!config.coverPhoto && (
              <div className="absolute flex flex-col items-center justify-center leading-none" style={{ left: '33%', width: '31%', top: '52%', height: '46%' }}>
                <span className="font-serif font-semibold text-goldDeep" style={{ fontSize: 'min(4.2dvh, 9vw)', lineHeight: 1.05 }}>{groom.nick[0]}</span>
                <span className="font-serif text-goldDeep" style={{ fontSize: 'min(2.2dvh, 4.6vw)' }}>&amp;</span>
                <span className="font-serif font-semibold text-goldDeep" style={{ fontSize: 'min(4.2dvh, 9vw)', lineHeight: 1.05 }}>{bride.nick[0]}</span>
              </div>
            )}
          </motion.div>
          <motion.h1 className="font-script gold-text leading-[1.1] mt-1" style={{ fontSize: 'min(8.6dvh, 15vw)' }} initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: 0.7, duration: 1 }}>
            {groom.nick} &amp; {bride.nick}
          </motion.h1>
          <motion.p className="font-serif text-lg md:text-xl tracking-wide mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>{dateLong(config.weddingDate)}</motion.p>
        </div>

        <div className="flex flex-col items-center gap-[1.6dvh] w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <p className="text-[12px] text-ink/70">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="font-serif text-2xl md:text-3xl font-semibold mt-0.5 max-w-[80vw] leading-tight line-clamp-2">{guest || 'Tamu Undangan'}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25 }} className="env-wrap">
            <Envelope stage={stage} guest={guest} />
          </motion.div>
          <motion.button
            type="button" onClick={onOpen} tabIndex={primary ? 0 : -1} disabled={stage !== 'idle'}
            className="btn-gold !px-7 !py-3 text-[15px]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            <MailOpen size={18} /> Buka Undangan
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function Cover({ config, guest, onOpen, onDone }: { config: SiteConfig; guest: string; onOpen: () => void; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>('idle');
  const gun = useAnimationControls();
  const open = () => {
    if (stage !== 'idle') return;
    onOpen(); // musik mulai tepat saat interaksi pengguna
    setStage('envelope');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { setStage('split'); gun.start({ scale: [0.5, 1.15], opacity: [0, 1, 1, 0], transition: { duration: 1.6, times: [0, 0.2, 0.7, 1] } }); }, reduced ? 50 : 1500);
    setTimeout(onDone, reduced ? 120 : 3000);
  };
  const ease = [0.76, 0, 0.24, 1] as const;
  return (
    <motion.div className="fixed inset-0 z-[90]" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      {/* gunungan muncul di celah saat pintu membelah */}
      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ opacity: 0 }} animate={gun}>
        <Orn name="gunungan" className="h-[78dvh] anim-glow" />
      </motion.div>
      <motion.div className="absolute inset-y-0 left-0 w-1/2 overflow-clip" style={{ boxShadow: stage === 'split' ? '8px 0 30px -10px rgb(0 0 0 / .35)' : 'none' }}
        animate={{ x: stage === 'split' ? '-102%' : 0 }} transition={{ duration: 1.4, ease }}>
        <Body config={config} guest={guest} stage={stage} onOpen={open} primary />
      </motion.div>
      <motion.div className="absolute inset-y-0 right-0 w-1/2 overflow-clip" style={{ boxShadow: stage === 'split' ? '-8px 0 30px -10px rgb(0 0 0 / .35)' : 'none' }}
        animate={{ x: stage === 'split' ? '102%' : 0 }} transition={{ duration: 1.4, ease }}>
        <Body config={config} guest={guest} stage={stage} onOpen={open} primary={false} />
      </motion.div>
    </motion.div>
  );
}
