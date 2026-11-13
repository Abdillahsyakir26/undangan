import { redirect } from 'next/navigation';
import { getConfig } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: { searchParams: { to?: string } }) {
  const to = searchParams.to ? `?to=${encodeURIComponent(searchParams.to)}` : '';
  redirect(`/${(await getConfig()).slug}${to}`);
}
