import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

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

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!anthropicApiKey) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local. Translation stopped.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

function normalizeName(name) {
  return name.replace(/-/g, " ").trim();
}

function buildPrompt(skill) {
  return [
    "You are translating UI labels for a Korean software marketplace.",
    "Return strict JSON only.",
    "",
    "Requirements:",
    '- Translate `name_ko` into a short, natural Korean product label.',
    '- Translate `description_ko` into natural Korean in 1-2 concise sentences.',
    "- Do not add markdown.",
    "- Preserve technical terms when common in Korean.",
    "",
    "JSON schema:",
    '{"name_ko":"...","description_ko":"..."}',
    "",
    `name: ${normalizeName(skill.name)}`,
    `public_id: ${skill.public_id}`,
    `description_en: ${skill.description_en}`
  ].join("\n");
}

async function translateSkill(skill) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 400,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: buildPrompt(skill)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status}`);
  }

  const payload = await response.json();
  const text = payload.content?.find((item) => item.type === "text")?.text?.trim();

  if (!text) {
    throw new Error(`Empty translation response for ${skill.source_id}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON translation response for ${skill.source_id}: ${text}`);
  }

  return {
    name_ko: parsed.name_ko?.trim() || null,
    description_ko: parsed.description_ko?.trim() || null
  };
}

async function fetchSkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("source_id, public_id, name, name_ko, description_en, description_ko, is_reviewed")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function updateSkillTranslation(skill, translation) {
  const { error } = await supabase
    .from("skills")
    .update({
      name_ko: translation.name_ko,
      description_ko: translation.description_ko
    })
    .eq("source_id", skill.source_id);

  if (error) {
    throw error;
  }
}

async function main() {
  const skills = await fetchSkills();
  const targets = skills.filter((skill) => !skill.name_ko || !skill.description_ko);

  console.log(`Loaded ${skills.length} skills. Translating ${targets.length} skills.`);

  let translated = 0;

  for (const skill of targets) {
    console.log(`Translating ${skill.source_id}...`);
    const translation = await translateSkill(skill);
    await updateSkillTranslation(skill, translation);
    translated += 1;
  }

  const finalSkills = await fetchSkills();
  const completeNameCount = finalSkills.filter((skill) => skill.name_ko).length;
  const completeDescriptionCount = finalSkills.filter((skill) => skill.description_ko).length;

  console.log(
    JSON.stringify(
      {
        translated,
        total: finalSkills.length,
        name_ko_filled: completeNameCount,
        description_ko_filled: completeDescriptionCount
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
