import { seedSkills } from "@/lib/seed-data";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Skill } from "@/lib/types";

const uncategorizedLabel = "기타";
const keywordIconMap = [
  { pattern: /(brand)/i, icon: "fingerprint" },
  { pattern: /(api|code)/i, icon: "code" },
  { pattern: /(art|canvas|design)/i, icon: "palette" },
  { pattern: /(doc|write|text)/i, icon: "file-text" },
  { pattern: /(auto|workflow)/i, icon: "zap" }
] as const;

function normalizeQuery(query: string | undefined) {
  return (query ?? "").trim().toLowerCase();
}

function normalizeCategory(category: string | undefined) {
  return (category ?? "").trim().toLowerCase();
}

function sortSkills(skills: Skill[]) {
  return [...skills].sort((left, right) => left.name.localeCompare(right.name));
}

export function getDisplayDescription(skill: Skill) {
  if (skill.description_ko && skill.is_reviewed) {
    return skill.description_ko;
  }

  return skill.description_en;
}

export function getDisplayName(skill: Skill) {
  return skill.name_ko?.trim() || skill.name.replace(/-/g, " ");
}

export function getDisplayOriginalName(skill: Skill) {
  return skill.name;
}

export async function getAllSkills() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return sortSkills(seedSkills);
  }

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) {
    return sortSkills(seedSkills);
  }

  return data as Skill[];
}

export async function searchSkillsByName(query: string | undefined) {
  const normalizedQuery = normalizeQuery(query);
  const skills = await getAllSkills();

  if (!normalizedQuery) {
    return skills;
  }

  return skills.filter((skill) => skill.name.toLowerCase().includes(normalizedQuery));
}

export async function getFilteredSkills(
  query: string | undefined,
  category: string | undefined
) {
  const normalizedQuery = normalizeQuery(query);
  const normalizedCategory = normalizeCategory(category);
  const skills = await getAllSkills();

  return skills.filter((skill) => {
    const matchesQuery = normalizedQuery
      ? skill.name.toLowerCase().includes(normalizedQuery)
      : true;
    const skillCategory = normalizeCategory(skill.category ?? "uncategorized");
    const matchesCategory = normalizedCategory && normalizedCategory !== "all"
      ? skillCategory === normalizedCategory
      : true;

    return matchesQuery && matchesCategory;
  });
}

export async function getSkillByPublicId(publicId: string) {
  const skills = await getAllSkills();
  return skills.find((skill) => skill.public_id === publicId) ?? null;
}

export async function getSkillCategories() {
  const skills = await getAllSkills();
  const categories = new Set<string>();

  for (const skill of skills) {
    categories.add(skill.category ?? "uncategorized");
  }

  return [...categories].sort((left, right) => left.localeCompare(right));
}

export function getCategoryLabel(category: string | null | undefined) {
  if (!category || category === "uncategorized") {
    return uncategorizedLabel;
  }

  return category
    .split("-")
    .filter(Boolean)
    .map((segment) => {
      if (segment === "ai") {
        return "AI";
      }

      const koreanMap: Record<string, string> = {
        creative: "크리에이티브",
        design: "디자인",
        enterprise: "엔터프라이즈",
        communication: "커뮤니케이션",
        development: "개발",
        technical: "기술",
        document: "문서",
        skills: "스킬",
        education: "교육",
        planning: "기획",
        automation: "자동화"
      };

      return koreanMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" · ");
}

export function getCategoryTheme(category: string | null | undefined) {
  if (category === "development-technical") {
    return {
      background: "#EEF2FF",
      stroke: "#4F46E5",
      icon: "code"
    } as const;
  }

  if (category === "document-skills") {
    return {
      background: "#F0FDF4",
      stroke: "#15803D",
      icon: "file-text"
    } as const;
  }

  if (category === "automation") {
    return {
      background: "#FEF3C7",
      stroke: "#D97706",
      icon: "zap"
    } as const;
  }

  if (category === "design") {
    return {
      background: "#FCE7F3",
      stroke: "#DB2777",
      icon: "palette"
    } as const;
  }

  return {
    background: "#FFF7ED",
    stroke: "#EA580C",
    icon: "sparkles"
  } as const;
}

export function getSkillIcon(skill: Skill) {
  const normalized = `${skill.name} ${skill.public_id}`.toLowerCase();

  for (const item of keywordIconMap) {
    if (item.pattern.test(normalized)) {
      return item.icon;
    }
  }

  return getCategoryTheme(skill.category).icon;
}
