/**
 * Skills data access layer.
 * Now uses Lovable Cloud (the default supabase client) instead of an external DB.
 * The shape mirrors the new schema (public_id, source_id, name_ko, ...).
 */
import { supabase } from '@/integrations/supabase/client';
import type { Skill } from '@/lib/skills';

export interface RawSkill {
  source_id: string | null;
  public_id: string | null;
  name: string;
  name_ko: string | null;
  description_en: string | null;
  description_ko: string | null;
  is_reviewed: boolean;
  github_url: string;
  source_repo: string;
  source_path: string;
  author: string;
  stars: number | null;
  compatible_with: string[] | null;
  category: string | null;
  updated_at: string;
  id?: string;
  view_count?: number;
  upvotes?: number;
  downvotes?: number;
  content_ko?: string | null;
  content_ko_updated_at?: string | null;
  summary_ko?: Skill['summary_ko'] | null;
  created_at?: string;
  featured?: boolean;
  saves?: number;
}

const SKILL_COLUMNS =
  'id, public_id, source_id, name, name_ko, description_en, description_ko, is_reviewed, github_url, source_repo, source_path, author, stars, compatible_with, category, created_at, updated_at, view_count, upvotes, downvotes, content_ko, content_ko_updated_at, summary_ko, featured, saves';

export function adaptSkill(row: RawSkill): Skill {
  return {
    id: row.public_id ?? row.id ?? row.source_id ?? row.name,
    uuid: row.id ?? '',
    name: row.name_ko?.trim() || row.name,
    description_ko: row.description_ko ?? row.description_en ?? null,
    description_en: row.description_en,
    github_url: row.github_url,
    source_repo: row.source_repo,
    source_path: row.source_path,
    author: row.author,
    stars: row.stars ?? 0,
    forks: 0,
    compatible_with: row.compatible_with ?? [],
    category: row.category,
    is_reviewed: row.is_reviewed,
    upvotes: row.upvotes ?? 0,
    downvotes: row.downvotes ?? 0,
    view_count: row.view_count ?? 0,
    created_at: row.created_at ?? row.updated_at,
    updated_at: row.updated_at,
    content_ko: row.content_ko ?? null,
    content_ko_updated_at: row.content_ko_updated_at ?? null,
    summary_ko: row.summary_ko ?? null,
    featured: row.featured ?? false,
    saves: row.saves ?? 0,
  };
}

export async function fetchSkills(): Promise<Skill[]> {
  const { data, error } = await supabase.from('skills').select(SKILL_COLUMNS);
  if (error) throw error;
  return ((data ?? []) as unknown as RawSkill[]).map(adaptSkill);
}

export async function fetchSimilarSkills(category: string, excludePublicId: string, limit = 3): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select(SKILL_COLUMNS)
    .eq('category', category)
    .neq('public_id', excludePublicId)
    .limit(20);
  if (error || !data) return [];
  const skills = (data as unknown as RawSkill[]).map(adaptSkill);
  // shuffle
  for (let i = skills.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [skills[i], skills[j]] = [skills[j], skills[i]];
  }
  return skills.slice(0, limit);
}

export async function fetchSkillByPublicId(publicId: string): Promise<Skill | null> {
  const { data, error } = await supabase
    .from('skills')
    .select(SKILL_COLUMNS)
    .eq('public_id', publicId)
    .maybeSingle();
  if (error || !data) return null;
  return adaptSkill(data as unknown as RawSkill);
}
