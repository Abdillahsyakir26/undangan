'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MusicPlayer({ playing, muted, title, onToggle, onMute }: { playing: boolean; muted: boolean; title: string; onToggle: () => void; onMute: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const t = setTimeout(() => setOpen(false), 5000); return () => clearTimeout(t); }, [open, playing, muted]);
  const status = muted ? 'Suara dimatikan' : playing ? 'Sedang diputar' : 'Dijeda';
  return (
    <motion.div className="fixed left-3 bottom-[88px] z-[60] flex items-center" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
      <motion.button aria-label="Pemutar musik" aria-expanded={open} onClick={() => setOpen((v) => !v)} whileTap={{ scale: 0.9 }}
        className="relative w-12 h-12 rounded-full text-white flex items-center justify-center shadow-xl"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgb(214 170 100), rgb(var(--c-gold-deep)))' }}>
        {playing && !muted && <span className="absolute inset-0 rounded-full border-2 border-gold" style={{ animation: 'ring 1.8s ease-out infinite' }} />}
        <span className={`absolute inset-[3px] rounded-full border border-dashed border-white/60 ${playing && !muted ? 'anim-spin-slow' : ''}`} style={{ animationDuration: '8s' }} />
        <Music2 size={20} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, x: -14, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -14, scale: 0.9 }}
            className="ml-2 flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-full bg-white/95 shadow-xl border border-gold/30 backdrop-blur">
            <div className="max-w-[120px]">
              <p className="text-[12px] font-medium truncate leading-tight">{title}</p>
              <p className="text-[10px] text-sageDeep leading-tight">{status}</p>
            </div>
            <div className="flex items-end gap-[2px] h-4 w-4" aria-hidden>
              {[0, 0.25, 0.5].map((d) => <span key={d} className="eq-bar w-[3px] h-full bg-gold rounded-sm" style={{ animationDelay: `${d}s`, animationPlayState: playing && !muted ? 'running' : 'paused' }} />)}
            </div>
            <button aria-label={playing ? 'Jeda' : 'Putar'} onClick={onToggle} className="w-9 h-9 rounded-full bg-gold/15 text-goldDeep flex items-center justify-center hover:bg-gold/25">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
            <button aria-label={muted ? 'Aktifkan suara' : 'Matikan suara'} onClick={onMute} className="w-9 h-9 rounded-full bg-gold/15 text-goldDeep flex items-center justify-center hover:bg-gold/25">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
