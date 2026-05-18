import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

/** Returns the set of skill UUIDs the current user has saved, plus a toggle helper. */
export function useSavedSkills() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('saved_skills')
      .select('skill_id')
      .eq('user_id', user.id);
    setSavedIds(new Set((data ?? []).map(r => r.skill_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const startGithubLogin = useCallback(async () => {
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
  }, []);

  const toggleSave = useCallback(
    async (skillUuid: string): Promise<'saved' | 'unsaved' | 'auth'> => {
      if (!user) {
        toast.error('로그인이 필요해요', {
          action: { label: 'Google 로그인', onClick: () => { void startGithubLogin(); } },
        });
        return 'auth';
      }
      const isSaved = savedIds.has(skillUuid);
      if (isSaved) {
        const next = new Set(savedIds); next.delete(skillUuid);
        setSavedIds(next);
        const { error } = await supabase
          .from('saved_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillUuid);
        if (error) {
          setSavedIds(savedIds);
          toast.error('저장 취소에 실패했어요');
          return 'saved';
        }
        toast.success('스킬함에서 빼냈어요');
        return 'unsaved';
      } else {
        const next = new Set(savedIds); next.add(skillUuid);
        setSavedIds(next);
        const { error } = await supabase
          .from('saved_skills')
          .insert({ user_id: user.id, skill_id: skillUuid });
        if (error) {
          setSavedIds(savedIds);
          toast.error('저장에 실패했어요');
          return 'unsaved';
        }
        toast.success('스킬함에 저장됐어요');
        return 'saved';
      }
    },
    [user, savedIds, startGithubLogin]
  );

  return { savedIds, toggleSave, loading, refresh, startGithubLogin, isAuthed: !!user };
}
