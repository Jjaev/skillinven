// Generate Korean summary_ko for skills missing it.
// Uses Lovable AI Gateway (LOVABLE_API_KEY auto-injected).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `당신은 AI CLI 스킬을 한국어로 요약하는 전문가입니다.
주어진 스킬의 이름, 작성자, GitHub URL을 바탕으로 친근하고 명확한 한국어 요약을 만드세요.
반드시 generate_summary 함수를 호출해 결과를 반환하세요.`;

const tool = {
  type: 'function',
  function: {
    name: 'generate_summary',
    description: 'Return a structured Korean summary of an AI CLI skill.',
    parameters: {
      type: 'object',
      properties: {
        what: { type: 'string', description: '한 줄로 이 스킬이 무엇인지 (40자 이내)' },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 4,
          description: '이 스킬의 장점 2~4개. 각 항목은 짧은 문장.',
        },
        howto: { type: 'string', description: '어떻게 사용하는지 한 줄로 (60자 이내)' },
        target: { type: 'string', description: '추천 대상 한 줄 (40자 이내)' },
        token_cost: { type: 'string', enum: ['low', 'medium', 'high'], description: '예상 토큰 소모량' },
      },
      required: ['what', 'benefits', 'howto', 'target', 'token_cost'],
      additionalProperties: false,
    },
  },
};

interface SkillRow {
  id: string;
  name: string;
  name_ko: string | null;
  description_en: string | null;
  description_ko: string | null;
  author: string;
  stars: number | null;
  github_url: string;
  source_repo: string;
  category: string | null;
}

async function generateForSkill(skill: SkillRow, apiKey: string) {
  const userPrompt = `다음 AI CLI 스킬을 한국어로 요약해주세요.

이름: ${skill.name_ko ?? skill.name}
원문 이름: ${skill.name}
작성자: ${skill.author}
별점: ${skill.stars ?? 0}개
카테고리: ${skill.category ?? '미분류'}
GitHub: ${skill.github_url}
설명(원문): ${skill.description_en ?? '없음'}
설명(한글): ${skill.description_ko ?? '없음'}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: 'function', function: { name: 'generate_summary' } },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const call = json?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error('No tool call returned');
  const args = JSON.parse(call.function.arguments);
  return args;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50);

    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name, name_ko, description_en, description_ko, author, stars, github_url, source_repo, category')
      .is('summary_ko', null)
      .limit(limit);

    if (error) throw error;
    if (!skills || skills.length === 0) {
      return new Response(JSON.stringify({ processed: 0, succeeded: 0, failed: 0, remaining: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let succeeded = 0;
    let failed = 0;
    const errors: { id: string; error: string }[] = [];

    for (const skill of skills as SkillRow[]) {
      try {
        const summary = await generateForSkill(skill, apiKey);
        const { error: updateErr } = await supabase
          .from('skills')
          .update({ summary_ko: summary })
          .eq('id', skill.id);
        if (updateErr) throw updateErr;
        succeeded++;
      } catch (e) {
        failed++;
        errors.push({ id: skill.id, error: e instanceof Error ? e.message : String(e) });
        console.error('Skill failed:', skill.id, e);
      }
    }

    const { count: remaining } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .is('summary_ko', null);

    return new Response(
      JSON.stringify({
        processed: skills.length,
        succeeded,
        failed,
        remaining: remaining ?? 0,
        errors: errors.slice(0, 5),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('generate-summary-ko error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
