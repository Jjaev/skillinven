import { createFileRoute } from '@tanstack/react-router';
import type {} from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const BASE_URL = 'https://skillschool.vercel.app';

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: '/', changefreq: 'daily', priority: '1.0' },
          { path: '/directory', changefreq: 'daily', priority: '0.9' },
          { path: '/community', changefreq: 'hourly', priority: '0.8' },
        ];

        try {
          const { data: skills } = await supabaseAdmin
            .from('skills')
            .select('public_id, updated_at')
            .eq('is_reviewed', true);
          for (const s of skills ?? []) {
            if (!s.public_id) continue;
            entries.push({
              path: `/request/${s.public_id}`,
              lastmod: s.updated_at ? new Date(s.updated_at).toISOString() : undefined,
              changefreq: 'weekly',
              priority: '0.7',
            });
          }
        } catch {}

        try {
          const { data: posts } = await supabaseAdmin
            .from('posts')
            .select('id, created_at');
          for (const p of posts ?? []) {
            entries.push({
              path: `/community/${p.id}`,
              lastmod: p.created_at ? new Date(p.created_at).toISOString() : undefined,
              changefreq: 'weekly',
              priority: '0.5',
            });
          }
        } catch {}

        const urls = entries.map((e) =>
          [
            '  <url>',
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            '  </url>',
          ].filter(Boolean).join('\n'),
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          '</urlset>',
        ].join('\n');

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
