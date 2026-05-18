/**
 * Server function for DeepL EN→KO translation with Lovable Cloud caching.
 * Caches by skill `public_id` so repeat requests hit Postgres, not DeepL.
 */
import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { fetchSkillMdRobust } from './fetch-skill-md';

interface TranslateInput {
  skillId: string; // public_id
  sourceRepo: string;
  sourcePath: string;
}

interface TranslateResult {
  ok: boolean;
  translated?: string;
  cached?: boolean;
  error?: string;
}

export const translateSkill = createServerFn({ method: 'POST' })
  .inputValidator((data: TranslateInput) => {
    if (
      !data ||
      typeof data.skillId !== 'string' ||
      typeof data.sourceRepo !== 'string' ||
      typeof data.sourcePath !== 'string'
    ) {
      throw new Error('Invalid input');
    }
    return data;
  })
  .handler(async ({ data }): Promise<TranslateResult> => {
    try {
      // 1) cache hit?
      const { data: existing } = await supabaseAdmin
        .from('skills')
        .select('content_ko')
        .eq('public_id', data.skillId)
        .maybeSingle();
      if (existing?.content_ko) {
        return { ok: true, translated: existing.content_ko, cached: true };
      }

      // 2) fetch raw markdown with fallback chain
      const fetched = await fetchSkillMdRobust(data.sourceRepo, data.sourcePath);
      if (!fetched.ok || !fetched.text) {
        return { ok: false, error: fetched.error ?? 'SKILL.md fetch failed' };
      }
      const original = fetched.text;

      const apiKey = process.env.DEEPL_API_KEY;
      if (!apiKey) return { ok: false, error: 'DeepL API key not configured' };

      const params = new URLSearchParams();
      params.append('text', original);
      params.append('target_lang', 'KO');
      params.append('source_lang', 'EN');
      params.append('preserve_formatting', '1');

      const dr = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!dr.ok) {
        const errText = await dr.text().catch(() => '');
        console.error('DeepL error:', dr.status, errText);
        return { ok: false, error: `번역 API 오류 (${dr.status})` };
      }

      const dj = await dr.json() as { translations?: { text: string }[] };
      const translated = dj.translations?.[0]?.text;
      if (!translated) return { ok: false, error: 'DeepL returned no translation' };

      // 3) cache it
      await supabaseAdmin
        .from('skills')
        .update({ content_ko: translated, content_ko_updated_at: new Date().toISOString() })
        .eq('public_id', data.skillId);

      return { ok: true, translated, cached: false };
    } catch (e) {
      console.error('translateSkill failed:', e);
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });
