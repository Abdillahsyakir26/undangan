import type { MetadataRoute } from 'next';
import { getConfig } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return [{ url: `${base}/${(await getConfig()).slug}`, changeFrequency: 'weekly', priority: 1 }];
}
