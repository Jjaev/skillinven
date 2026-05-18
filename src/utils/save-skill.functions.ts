import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/** Increments saves count for a skill identified by its public_id. */
export const incrementSkillSave = createServerFn({ method: 'POST' })
  .inputValidator((data: { publicId: string }) => data)
  .handler(async ({ data }) => {
    const { data: row, error: lookupErr } = await supabaseAdmin
      .from('skills')
      .select('id')
      .eq('public_id', data.publicId)
      .maybeSingle();
    if (lookupErr || !row) {
      return { ok: false as const, error: lookupErr?.message ?? 'Skill not found' };
    }
    const { error } = await supabaseAdmin.rpc('increment_skill_save', {
      _skill_id: row.id,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
