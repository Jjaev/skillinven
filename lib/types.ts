export interface Skill {
  source_id: string;
  public_id: string;
  name: string;
  name_ko?: string | null;
  description_en: string;
  description_ko: string | null;
  is_reviewed: boolean;
  github_url: string;
  source_repo: string;
  source_path: string;
  author: string;
  stars: number | null;
  compatible_with: string[];
  category: string | null;
  updated_at: string;
}
