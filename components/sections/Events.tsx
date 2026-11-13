'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Clock, ExternalLink, Map, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import type { EventItem, SiteConfig } from '@/lib/types';
import { dateLong, dateParts, googleCalUrl, icsContent, mapQuery } from '@/lib/format';
import { Orn, Reveal, Section, SectionTitle } from '../ui';

function downloadIcs(e: EventItem, couple: string) {
  const blob = new Blob([icsContent(e, couple)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${e.id}.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function EventCard({ e, i, couple }: { e: EventItem; i: number; couple: string }) {
  const [map, setMap] = useState(false);
  const [cal, setCal] = useState(false);
  const p = dateParts(e.date);
  return (
    <Reveal v={i % 2 ? 'right' : 'left'} delay={0.05} className="card-gold p-7 md:p-9 text-center relative overflow-visible">
      <Orn name="cloud1" className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 anim-drift" />
      <h3 className="font-script text-4xl gold-text mt-5">{e.title}</h3>
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-xs tracking-widest uppercase text-ink/60">{p.dow}</span>
        <motion.span className="font-serif text-6xl font-semibold text-goldDeep leading-none" initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120 }}>{p.day}</motion.span>
        <span className="text-xs tracking-widest uppercase text-ink/60">{p.month}<br />{p.year}</span>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-[15px]"><Clock size={16} className="text-gold" /> {e.start} – {e.end} {e.tz}</p>
      <p className="mt-4 font-serif text-xl font-semibold">{e.venue}</p>
      <p className="mt-1 text-sm text-ink/70 flex items-start justify-center gap-1.5 max-w-xs mx-auto"><MapPin size={16} className="text-gold shrink-0 mt-0.5" />{e.address}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <motion.a whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }} className="btn-gold" href={e.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery(e)}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Google Maps</motion.a>
        <motion.a whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }} className="btn-ghost" href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery(e)}`} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Petunjuk Arah</motion.a>
        <div className="relative">
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ y: -2 }} className="btn-ghost" onClick={() => setCal((v) => !v)} aria-expanded={cal}><CalendarPlus size={16} /> Simpan Jadwal</motion.button>
          <AnimatePresence>
            {cal && (
              <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }} className="absolute z-20 left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gold/30 overflow-hidden text-sm">
                <a className="block px-4 py-2.5 hover:bg-cream" href={googleCalUrl(e, couple)} target="_blank" rel="noopener noreferrer" onClick={() => setCal(false)}>Google Calendar</a>
                <button className="block w-full text-left px-4 py-2.5 hover:bg-cream border-t border-gold/15" onClick={() => { downloadIcs(e, couple); setCal(false); }}>Apple / Outlook (.ics)</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <button className="mt-4 text-xs text-sageDeep underline underline-offset-4 inline-flex items-center gap-1" onClick={() => setMap((v) => !v)}><Map size={13} /> {map ? 'Sembunyikan peta' : 'Tampilkan peta'}</button>
      <AnimatePresence initial={false}>
        {map && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 220, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 rounded-2xl border border-gold/30">
            <iframe title={`Peta ${e.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-[220px]" src={`https://maps.google.com/maps?q=${mapQuery(e)}&output=embed`} />
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

export default function Events({ config }: { config: SiteConfig }) {
  const couple = `${config.couple.groom.nick} & ${config.couple.bride.nick}`;
  return (
    <Section id="acara" className="paper">
      <Orn name="payung" className="absolute right-2 top-10 h-[46%] max-h-[420px] opacity-90 anim-sway hidden md:block" />
      <Orn name="payung" className="absolute left-2 top-10 h-[46%] max-h-[420px] opacity-90 anim-sway hidden md:block -scale-x-100" />
      <SectionTitle eyebrow="Save The Date" title="Detail Acara" sub={`Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda pada ${dateLong(config.weddingDate)}.`} />
      <div className="max-w-xl mx-auto grid gap-12">
        {config.events.map((e, i) => <EventCard key={e.id} e={e} i={i} couple={couple} />)}
      </div>
    </Section>
  );
}
