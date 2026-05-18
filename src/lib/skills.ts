/**
 * Helpers for the new GitHub-backed skills schema.
 */

export interface Skill {
  /** Public slug used in URLs (public_id). */
  id: string;
  /** Database UUID (skills.id) — used for relations like saved_skills. */
  uuid: string;
  name: string;
  description_ko: string | null;
  description_en: string | null;
  github_url: string;
  source_repo: string;
  source_path: string;
  author: string;
  stars: number;
  forks: number;
  compatible_with: string[];
  category: string | null;
  is_reviewed: boolean;
  upvotes: number;
  downvotes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  content_ko: string | null;
  content_ko_updated_at: string | null;
  summary_ko: {
    what?: string;
    benefits?: string[];
    howto?: string;
    target?: string;
    token_cost?: 'low' | 'medium' | 'high';
  } | null;
  featured: boolean;
  saves: number;
}

/** 스킬이 7일 이내에 추가되었는지. */
export function isNewSkill(created_at: string): boolean {
  const ageMs = Date.now() - new Date(created_at).getTime();
  return ageMs < 7 * 24 * 60 * 60 * 1000;
}

/** raw.githubusercontent.com URL for the SKILL.md file. */
export function rawSkillMdUrl(s: Pick<Skill, 'source_repo' | 'source_path'>): string {
  return `https://raw.githubusercontent.com/${s.source_repo}/main/${s.source_path}`;
}

/** Repo basename, e.g. "garrytan/gstack" -> "gstack". */
export function repoBasename(source_repo: string): string {
  const parts = source_repo.split('/');
  return parts[parts.length - 1] ?? source_repo;
}

/** Skill folder relative to repo root, e.g. "review/SKILL.md" -> "review". */
export function skillFolder(source_path: string): string {
  const idx = source_path.lastIndexOf('/');
  return idx === -1 ? '' : source_path.slice(0, idx);
}

/** One-line install command users paste in their terminal. */
export function installCommand(s: Pick<Skill, 'source_repo' | 'source_path'>): string {
  const repo = repoBasename(s.source_repo);
  const folder = skillFolder(s.source_path);
  return `git clone --depth 1 https://github.com/${s.source_repo}.git /tmp/${repo} && cp -r /tmp/${repo}/${folder} ~/.claude/skills/`;
}

export const SKILL_CATEGORIES = ['개발기술', '문서자동화', '크리에이티브', '데이터', '기타'] as const;
export const SKILL_CLIS = ['claude', 'codex', 'gemini'] as const;
export type SkillCli = (typeof SKILL_CLIS)[number];
export const SKILL_CLI_LABELS: Record<SkillCli, string> = {
  claude: 'Claude',
  codex: 'Codex',
  gemini: 'Gemini',
};

const HANGUL_RE = /[\u3131-\uD79D]/;
export function isKoreanContributor(author: string | null | undefined): boolean {
  if (!author) return false;
  return HANGUL_RE.test(author);
}
