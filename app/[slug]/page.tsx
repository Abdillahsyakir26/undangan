import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/db';
import { clean } from '@/lib/validate';
import { dateLong } from '@/lib/format';
import Invitation from '@/components/Invitation';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string }; searchParams: { to?: string | string[] } };
const guestOf = (sp: Props['searchParams']) => clean(Array.isArray(sp.to) ? sp.to[0] : sp.to, 60);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = await getConfig();
  if (params.slug !== c.slug) return { title: 'Tidak ditemukan' };
  const guest = guestOf(searchParams);
  const title = c.siteTitle;
  const desc = `${guest ? `Kepada Yth. ${guest} — ` : ''}Kami mengundang Anda di pernikahan ${c.couple.groom.nick} & ${c.couple.bride.nick}, ${dateLong(c.weddingDate)}.`;
  return {
    title, description: desc,
    openGraph: { title, description: desc, type: 'website', locale: 'id_ID', images: [{ url: '/og.jpg', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: desc, images: ['/og.jpg'] },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const config = await getConfig();
  if (params.slug !== config.slug) notFound();
  const ld = {
    '@context': 'https://schema.org', '@type': 'Event', name: config.siteTitle, startDate: config.weddingDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: config.events[0] ? { '@type': 'Place', name: config.events[0].venue, address: config.events[0].address } : undefined,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <Invitation config={config} guest={guestOf(searchParams)} />
    </>
  );
}
