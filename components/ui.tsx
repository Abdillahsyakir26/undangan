'use client';
import { motion, type Variants } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

export const ORN = (n: string) => `/orn/${n}.webp`;

export function Orn({ name, className = '', style, alt = '' }: { name: string; className?: string; style?: CSSProperties; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ORN(name)} alt={alt} aria-hidden={!alt} draggable={false} loading="lazy" decoding="async" className={`select-none pointer-events-none ${className}`} style={style} />;
}

const V: Record<string, Variants> = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: 'blur(12px)', y: 16 }, show: { opacity: 1, filter: 'blur(0px)', y: 0 } },
  rise: { hidden: { opacity: 0, y: 70, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } },
};
export function Reveal({ children, v = 'up', delay = 0, duration = 0.9, className = '', once = true, as = 'div' }: {
  children: ReactNode; v?: keyof typeof V; delay?: number; duration?: number; className?: string; once?: boolean; as?: 'div' | 'p' | 'h2' | 'h3' | 'li' | 'span';
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={V[v]} initial="hidden" whileInView="show" viewport={{ once, amount: 0.2, margin: '0px 0px -40px 0px' }} transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}

export const stagger = (s = 0.12, d = 0): Variants => ({ hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } } });
export const itemUp: Variants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-10 md:mb-14 relative">
      {eyebrow && <Reveal v="down"><p className="tracking-[.35em] uppercase text-[11px] text-sageDeep font-medium">{eyebrow}</p></Reveal>}
      <Reveal v="blur" delay={0.1}><h2 className="font-script text-5xl md:text-6xl gold-text mt-2 leading-[1.15] pb-1">{title}</h2></Reveal>
      <Reveal v="zoom" delay={0.25} className="flex items-center justify-center gap-3 mt-2">
        <motion.span className="h-px w-16 bg-gradient-to-r from-transparent to-gold origin-right" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} />
        <Orn name="cloud3" className="w-14 anim-drift" />
        <motion.span className="h-px w-16 bg-gradient-to-l from-transparent to-gold origin-left" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} />
      </Reveal>
      {sub && <Reveal delay={0.3}><p className="mt-4 text-ink/70 max-w-md mx-auto text-[15px] leading-relaxed">{sub}</p></Reveal>}
    </div>
  );
}

/** Pembatas antar section: semak bunga yang tumbuh dari bawah */
export function FlowerEdge({ flip = false, variant = 1 }: { flip?: boolean; variant?: 1 | 2 }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute left-0 right-0 flex justify-center ${flip ? 'top-0 rotate-180 -translate-y-[96%]' : 'bottom-0 translate-y-[2px]'} z-0`}
      initial={{ opacity: 0, scaleY: 0.2 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: flip ? 'top' : 'bottom' }}
    >
      <Orn name={variant === 1 ? 'semak1' : 'semak2'} className={`anim-sway ${variant === 1 ? 'w-[130%] max-w-[720px]' : 'w-[90%] max-w-[520px]'}`} />
    </motion.div>
  );
}

export function Section({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`relative scroll-mt-4 px-5 py-20 md:py-28 overflow-hidden ${className}`}>{children}</section>;
}

export function Toast({ show, children, tone = 'ok' }: { show: boolean; children: ReactNode; tone?: 'ok' | 'err' }) {
  return (
    <motion.div role="status" aria-live="polite" initial={false} animate={show ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
      className={`fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] px-5 py-3 rounded-full text-sm shadow-xl pointer-events-none ${tone === 'ok' ? 'bg-sageDeep text-white' : 'bg-[#a8453b] text-white'}`}>
      {children}
    </motion.div>
  );
}
