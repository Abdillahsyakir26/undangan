'use client';
import { motion } from 'framer-motion';
import { Orn } from './ui';

export default function Loader({ progress, initials }: { progress: number; initials: string }) {
  return (
    <motion.div className="fixed inset-0 z-[100] paper flex flex-col items-center justify-center" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.8 } }}>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full border border-gold/40" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <motion.div className="absolute inset-3 rounded-full border border-gold/30" animate={{ scale: [1, 1.25], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }} />
        <Orn name="gunungan" className="absolute w-24 anim-glow" />
        <motion.span className="relative font-script text-3xl text-white drop-shadow" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>{initials}</motion.span>
      </div>
      <p className="mt-8 font-script text-3xl gold-text">Memuat undangan…</p>
      <div className="mt-4 h-[3px] w-48 rounded-full bg-gold/20 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-gold to-goldDeep" animate={{ width: `${Math.max(8, progress)}%` }} transition={{ ease: 'easeOut', duration: 0.4 }} />
      </div>
    </motion.div>
  );
}
