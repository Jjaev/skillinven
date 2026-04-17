import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import seedSkills from "../data/seed-skills.json" with { type: "json" };

const DIRECT_SKILL_SOURCES = [
  {
    owner: "vercel-labs",
    repo: "skills",
    skill: "find-skills",
    installs: 418000,
    compatible_with: ["claude", "codex"]
  },
  {
    owner: "vercel-labs",
    repo: "agent-skills",
    skill: "react-best-practices",
    installs: 176000,
    compatible_with: ["claude", "codex"]
  },
  {
    owner: "anthropics",
    repo: "skills",
    skill: "frontend-design",
    installs: 124000,
    compatible_with: ["claude", "codex"]
  }
];

const KOREAN_TRANSLATIONS = {
  "anthropics/skills/algorithmic-art":
    "p5.js 같은 코드 기반 규칙과 생성 시스템으로 결과물까지 이어지는 알고리즘 아트를 만들 때 유용한 스킬입니다.",
  "anthropics/skills/brand-guidelines":
    "브랜드 톤과 카피, 시각 규칙을 맞춰서 결과물을 일관된 브랜드 스타일로 정리할 때 쓰기 좋습니다.",
  "anthropics/skills/canvas-design":
    "포스터나 비주얼 아트처럼 정적인 디자인 결과물을 빠르게 구성하고 다듬을 때 도움 되는 스킬입니다.",
  "anthropics/skills/frontend-design":
    "UI 구조와 화면 완성도, 상호작용 방향까지 포함해 프론트엔드 디자인 품질을 끌어올릴 때 적합한 스킬입니다.",
  "anthropics/skills/claude-api":
    "Claude API 앱을 만들거나 디버깅할 때 성능과 구조를 함께 점검하도록 돕는 개발용 스킬입니다.",
  "anthropics/skills/doc-coauthoring":
    "기획서나 문서 초안을 함께 다듬고 공동 작성 흐름을 정리할 때 유용한 문서 협업 스킬입니다.",
  "anthropics/skills/docx":
    "Word 문서를 만들거나 수정하고 내용을 구조적으로 다뤄야 할 때 쓰기 좋은 문서 작업 스킬입니다.",
  "anthropics/skills/pdf":
    "PDF 읽기, 추출, 생성, 병합 같은 반복 작업을 빠르게 처리할 때 활용할 수 있는 스킬입니다.",
  "anthropics/skills/mcp-builder":
    "외부 API나 서비스와 연결되는 MCP 서버를 설계하고 구현할 때 필요한 흐름을 정리해주는 스킬입니다.",
  "vercel-labs/skills/find-skills":
    "필요한 기능에 맞는 에이전트 스킬을 찾고 설치 후보를 추천할 때 도움 되는 검색형 스킬입니다.",
  "vercel-labs/agent-skills/react-best-practices":
    "React와 Next.js 코드에서 성능 병목과 구조 문제를 점검하고 모범 사례를 적용할 때 유용한 스킬입니다.",
  "anthropics/skills/internal-comms":
    "팀 공지나 상태 공유, FAQ 같은 내부 커뮤니케이션 문서를 빠르게 정리할 때 적합한 스킬입니다."
};

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const githubToken = process.env.GITHUB_TOKEN;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    return {};
  }

  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
      })
  );
}

function extractDescription(markdown) {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  const firstParagraph = body.split("\n\n").find((chunk) => chunk.trim());
  return firstParagraph?.replace(/\n/g, " ").trim() ?? "";
}

function guessCompatibleAgents(text, fallback = ["claude"]) {
  const lower = text.toLowerCase();
  const compatible = new Set(fallback);

  if (lower.includes("codex")) compatible.add("codex");
  if (lower.includes("chatgpt")) compatible.add("chatgpt");
  if (lower.includes("gemini")) compatible.add("gemini");
  if (lower.includes("cursor")) compatible.add("cursor");

  return [...compatible];
}

function classifyCategory({ name, description, sourceId }) {
  const lower = `${name} ${description} ${sourceId}`.toLowerCase();

  if (
    lower.includes("design") ||
    lower.includes("frontend") ||
    lower.includes("ui") ||
    lower.includes("ux") ||
    lower.includes("art") ||
    lower.includes("theme")
  ) {
    return "design";
  }

  if (
    lower.includes("workflow") ||
    lower.includes("automation") ||
    lower.includes("scrape") ||
    lower.includes("crawl") ||
    lower.includes("deploy") ||
    lower.includes("notification") ||
    lower.includes("search")
  ) {
    return "automation";
  }

  if (
    lower.includes("doc") ||
    lower.includes("pdf") ||
    lower.includes("pptx") ||
    lower.includes("xlsx") ||
    lower.includes("word") ||
    lower.includes("content") ||
    lower.includes("writing") ||
    lower.includes("brand") ||
    lower.includes("communication") ||
    lower.includes("skill")
  ) {
    return "document-skills";
  }

  if (
    lower.includes("react") ||
    lower.includes("next") ||
    lower.includes("api") ||
    lower.includes("code") ||
    lower.includes("testing") ||
    lower.includes("mcp") ||
    lower.includes("postgres") ||
    lower.includes("sdk") ||
    lower.includes("framework") ||
    lower.includes("typescript")
  ) {
    return "development-technical";
  }

  return "uncategorized";
}

function applyLocalMetadata(skill) {
  const descriptionKo = KOREAN_TRANSLATIONS[skill.source_id] ?? null;
  return {
    ...skill,
    description_ko: descriptionKo,
    is_reviewed: false,
    category: classifyCategory({
      name: skill.name,
      description: skill.description_en,
      sourceId: skill.source_id
    })
  };
}

async function githubJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${url}`);
  }

  return response.json();
}

async function githubText(url) {
  const response = await fetch(url, {
    headers: githubToken ? { Authorization: `Bearer ${githubToken}` } : {}
  });

  if (!response.ok) {
    throw new Error(`GitHub raw request failed: ${response.status} ${url}`);
  }

  return response.text();
}

async function fetchGitHubSkill({ owner, repo, skill, installs = null, compatible_with = ["claude"] }) {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/skills/${skill}/SKILL.md`;
  const markdown = await githubText(rawUrl);
  const frontmatter = parseFrontmatter(markdown);
  const name = frontmatter.name || skill;
  const description = frontmatter.description || extractDescription(markdown);
  const sourceId = `${owner}/${repo}/${skill}`;

  return applyLocalMetadata({
    source_id: sourceId,
    public_id: slugify(name),
    name,
    description_en: description,
    description_ko: null,
    is_reviewed: false,
    github_url: `https://github.com/${owner}/${repo}/tree/main/skills/${skill}`,
    source_repo: `${owner}/${repo}`,
    source_path: `skills/${skill}/SKILL.md`,
    author: owner,
    stars: installs,
    compatible_with: guessCompatibleAgents(markdown, compatible_with),
    category: null,
    updated_at: new Date().toISOString()
  });
}

async function fetchAnthropicSkills() {
  const directories = await githubJson("https://api.github.com/repos/anthropics/skills/contents/skills");
  const skills = [];

  for (const entry of directories.filter((item) => item.type === "dir")) {
    try {
      skills.push(await fetchGitHubSkill({
        owner: "anthropics",
        repo: "skills",
        skill: entry.name,
        compatible_with: ["claude"]
      }));
    } catch (error) {
      console.log(`Skipped anthropics/${entry.name}: ${error.message}`);
    }
  }

  return skills;
}

async function fetchPrioritySkills() {
  const skills = [];

  for (const source of DIRECT_SKILL_SOURCES) {
    try {
      skills.push(await fetchGitHubSkill(source));
    } catch (error) {
      console.log(`Skipped ${source.owner}/${source.skill}: ${error.message}`);
    }
  }

  return skills;
}

function parseAwesomeSkills(readme) {
  const lines = readme.split("\n");
  const items = [];

  for (const line of lines) {
    const match = line.match(/^- \*\*\[([^/\]]+)\/([^\]]+)\]\(([^)]+)\)\*\* - (.+)$/);

    if (!match) {
      continue;
    }

    const [, owner, skill, link, description] = match;
    items.push({ owner, skill, link, description });
  }

  return items;
}

async function fetchAwesomeReadmeSkills() {
  const readme = await githubText(
    "https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/README.md"
  );
  const parsed = parseAwesomeSkills(readme);
  const filtered = parsed.filter(
    (item) =>
      item.owner !== "anthropics" &&
      item.skill !== "react-best-practices" &&
      item.skill !== "frontend-design" &&
      item.skill !== "find-skills"
  );

  const topTwenty = filtered.slice(0, 20);

  return topTwenty.map((item) =>
    applyLocalMetadata({
      source_id: `awesome/${item.owner}/${item.skill}`,
      public_id: slugify(item.skill),
      name: item.skill,
      description_en: item.description.trim(),
      description_ko: null,
      is_reviewed: false,
      github_url: item.link,
      source_repo: "VoltAgent/awesome-agent-skills",
      source_path: "README.md",
      author: item.owner,
      stars: null,
      compatible_with: guessCompatibleAgents(item.description, ["claude", "codex"]),
      category: null,
      updated_at: new Date().toISOString()
    })
  );
}

function ensureUniquePublicIds(skills) {
  const seen = new Map();

  return skills.map((skill) => {
    const currentCount = seen.get(skill.public_id) ?? 0;

    if (currentCount === 0) {
      seen.set(skill.public_id, 1);
      return skill;
    }

    const ownerPart = skill.source_id.split("/")[1] ?? "skill";
    const nextPublicId = `${slugify(ownerPart)}-${skill.public_id}`;
    seen.set(skill.public_id, currentCount + 1);

    return {
      ...skill,
      public_id: nextPublicId
    };
  });
}

function mergeBySourceId(skills) {
  const merged = new Map();

  for (const skill of skills) {
    merged.set(skill.source_id, skill);
  }

  return [...merged.values()];
}

async function buildPayload() {
  const anthropic = await fetchAnthropicSkills();
  const priority = await fetchPrioritySkills();
  const awesome = await fetchAwesomeReadmeSkills();

  return ensureUniquePublicIds(mergeBySourceId([...seedSkills, ...anthropic, ...priority, ...awesome]));
}

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.log("Supabase env not set. Printing fallback seed payload instead.");
    console.log(JSON.stringify(seedSkills, null, 2));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const payload = await buildPayload();
  const { error } = await supabase.from("skills").upsert(payload, {
    onConflict: "source_id"
  });

  if (error) {
    throw error;
  }

  console.log(`Imported ${payload.length} skills.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
