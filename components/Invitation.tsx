'use client';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SiteConfig } from '@/lib/types';
import { initials } from '@/lib/format';
import { Toast } from './ui';
import Loader from './Loader';
import Cover from './Cover';
import MusicPlayer from './Music';
import { FloatNav, ScrollProgress, SpeedDial } from './FloatNav';
import Hero from './sections/Hero';
import Profile from './sections/Profile';
import Countdown from './sections/Countdown';
import Events from './sections/Events';
import Story from './sections/Story';
import Gallery from './sections/Gallery';
import Rsvp from './sections/Rsvp';
import Wishes from './sections/Wishes';
import Gift from './sections/Gift';
import Closing from './sections/Closing';

type Phase = 'loading' | 'cover' | 'main';

export default function Invitation({ config, guest }: { config: SiteConfig; guest: string }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(5);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState<{ m: string; t: 'ok' | 'err'; show: boolean }>({ m: '', t: 'ok', show: false });
  const audio = useRef<HTMLAudioElement | null>(null);
  const wasPlaying = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const { groom, bride } = config.couple;

  const t = config.theme;
  const vars = { '--c-gold': t.gold, '--c-gold-deep': t.goldDeep, '--c-sage': t.sage, '--c-sage-deep': t.sageDeep, '--c-cream': t.cream, '--c-cream-deep': t.creamDeep, '--c-ink': t.ink } as CSSProperties;

  const notify = useCallback((m: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ m, t: tone, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((s) => ({ ...s, show: false })), 2800);
  }, []);

  // loading screen: pra-muat ornamen utama
  useEffect(() => {
    const files = ['gapura', 'gunungan', 'lantern1', 'lantern2', 'cloud1', 'cloud2', 'sudut'];
    let done = 0; let alive = true;
    const bump = () => { done++; if (alive) setProgress(10 + Math.round((done / files.length) * 90)); };
    files.forEach((f) => { const im = new Image(); im.onload = im.onerror = bump; im.src = `/orn/${f}.webp`; });
    const min = new Promise((r) => setTimeout(r, 1400));
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    const imgs = new Promise<void>((r) => { const iv = setInterval(() => { if (done >= files.length) { clearInterval(iv); r(); } }, 80); setTimeout(() => { clearInterval(iv); r(); }, 6000); });
    Promise.all([min, imgs, fonts]).then(() => alive && setPhase('cover'));
    return () => { alive = false; };
  }, []);

  // kunci scroll selama loading & cover
  useEffect(() => {
    document.documentElement.classList.toggle('lock', phase !== 'main');
    document.body.classList.toggle('lock', phase !== 'main');
    if (phase === 'main') window.scrollTo(0, 0);
  }, [phase]);

  // statistik kunjungan
  useEffect(() => {
    let id = '';
    try { id = localStorage.getItem('vid') || ''; if (!id) { id = crypto.randomUUID(); localStorage.setItem('vid', id); } } catch { id = 'anon-' + Math.random().toString(36).slice(2, 10); }
    fetch('/api/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor: id, guest, kind: 'view' }), keepalive: true }).catch(() => {});
    (window as unknown as { __vid: string }).__vid = id;
  }, [guest]);

  const play = useCallback(() => {
    const a = audio.current; if (!a) return;
    a.volume = 0; a.muted = false; setMuted(false);
    a.play().then(() => {
      setPlaying(true);
      let v = 0; const iv = setInterval(() => { v = Math.min(0.7, v + 0.05); a.volume = v; if (v >= 0.7) clearInterval(iv); }, 120); // fade-in
    }).catch(() => setPlaying(false));
  }, []);
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) { if (a.muted) { a.muted = false; setMuted(false); } a.volume = 0.7; a.play().then(() => setPlaying(true)).catch(() => {}); } else { a.pause(); setPlaying(false); } };
  const mute = () => { const a = audio.current; if (!a) return; a.muted = !a.muted; setMuted(a.muted); };

  const onOpen = () => {
    play();
    const id = (window as unknown as { __vid?: string }).__vid;
    if (id) fetch('/api/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor: id, guest, kind: 'open' }), keepalive: true }).catch(() => {});
  };

  // hemat baterai: jeda saat tab disembunyikan, lanjut saat kembali
  useEffect(() => {
    const f = () => {
      const a = audio.current; if (!a) return;
      if (document.hidden) { wasPlaying.current = !a.paused; if (!a.paused) a.pause(); }
      else if (wasPlaying.current) { a.play().catch(() => {}); }
    };
    document.addEventListener('visibilitychange', f); return () => document.removeEventListener('visibilitychange', f);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div style={vars} className="relative">
        <audio ref={audio} src={config.music.src} loop preload="none" />
        <AnimatePresence>{phase === 'loading' && <Loader key="loader" progress={progress} initials={`${groom.nick[0] || ''}&${bride.nick[0] || ''}`} />}</AnimatePresence>
        <AnimatePresence>{phase === 'cover' && <Cover key="cover" config={config} guest={guest} onOpen={onOpen} onDone={() => setPhase('main')} />}</AnimatePresence>

        <main aria-hidden={phase !== 'main'}>
          <Hero config={config} guest={guest} />
          <Profile config={config} />
          <Countdown config={config} />
          <Events config={config} />
          <Story config={config} />
          <Gallery config={config} />
          <Rsvp guest={guest} onToast={notify} />
          <Wishes guest={guest} onToast={notify} />
          <Gift config={config} guest={guest} onToast={notify} />
          <Closing config={config} />
        </main>

        {phase === 'main' && (
          <>
            <ScrollProgress />
            <FloatNav />
            <MusicPlayer playing={playing} muted={muted} title={config.music.title} onToggle={toggle} onMute={mute} />
            <SpeedDial whatsapp={config.whatsapp} title={config.siteTitle} text={`Undangan pernikahan ${groom.nick} & ${bride.nick}`} />
          </>
        )}
        <Toast show={toast.show} tone={toast.t}>{toast.m}</Toast>
      </div>
    </MotionConfig>
  );
}
