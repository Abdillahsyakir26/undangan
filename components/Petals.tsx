'use client';
import { useEffect, useState } from 'react';
import { Orn } from './ui';

const SPR = ['f1', 'f2', 'f4', 'f5', 'f6', 'f3'];
export default function Petals({ count = 14, className = '' }: { count?: number; className?: string }) {
  const [items, setItems] = useState<{ n: string; left: number; w: number; dur: number; delay: number; dx: number; rot: number }[]>([]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const low = (navigator.hardwareConcurrency || 4) <= 2;
    const c = low ? Math.ceil(count / 2) : count;
    setItems(Array.from({ length: c }, (_, i) => ({
      n: SPR[i % SPR.length], left: Math.random() * 100, w: 14 + Math.random() * 16, dur: 9 + Math.random() * 9,
      delay: -Math.random() * 14, dx: (Math.random() - 0.5) * 160, rot: 360 + Math.random() * 540,
    })));
  }, [count]);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((p, i) => (
        <span key={i} className="petal" style={{ left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ['--dx' as string]: `${p.dx}px`, ['--rot' as string]: `${p.rot}deg` }}>
          <Orn name={p.n} className="" style={{ width: p.w }} />
        </span>
      ))}
    </div>
  );
}
