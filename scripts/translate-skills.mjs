import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const TRANSLATIONS = {
  "anthropics/skills/algorithmic-art": {
    name_ko: "알고리즘 아트",
    description_ko:
      "p5.js 같은 코드 기반 규칙과 생성 시스템으로 비주얼 아트를 만들 때 유용한 스킬입니다. 시드 랜덤, 파라미터 탐색, 생성형 아트워크 작업 흐름에 잘 맞습니다."
  },
  "awesome/better-auth/best-practices": {
    name_ko: "모범 사례",
    description_ko:
      "Better Auth를 프로젝트에 안정적으로 통합할 때 따라야 할 구조와 운영 원칙을 정리한 스킬입니다. 인증 흐름을 더 안전하고 일관되게 구성할 때 도움이 됩니다."
  },
  "anthropics/skills/brand-guidelines": {
    name_ko: "브랜드 가이드라인",
    description_ko:
      "브랜드 톤, 카피, 색상, 타이포그래피를 결과물 전반에 일관되게 적용할 때 쓰기 좋은 스킬입니다. 시각적 완성도와 브랜드 정합성을 함께 맞추는 데 적합합니다."
  },
  "anthropics/skills/canvas-design": {
    name_ko: "캔버스 디자인",
    description_ko:
      "포스터나 정적인 비주얼 결과물을 빠르게 구성하고 다듬을 때 활용하는 디자인 스킬입니다. 한 장짜리 그래픽이나 아트워크를 만들 때 특히 유용합니다."
  },
  "anthropics/skills/claude-api": {
    name_ko: "클로드 API",
    description_ko:
      "Claude API와 Anthropic SDK 기반 앱을 설계, 디버깅, 최적화할 때 도움 되는 개발 스킬입니다. 모델 버전 변경이나 프롬프트 캐싱 같은 운영 이슈도 함께 다룹니다."
  },
  "awesome/composiohq/composio": {
    name_ko: "콤포지오",
    description_ko:
      "AI 에이전트를 다양한 외부 앱과 연결할 때 필요한 인증과 연동 흐름을 다루는 스킬입니다. 여러 SaaS를 묶어 자동화하는 워크플로에 적합합니다."
  },
  "awesome/trycourier/courier-skills": {
    name_ko: "코리어 스킬",
    description_ko:
      "이메일, SMS, 푸시, 채팅 등 여러 채널로 알림을 보내는 구조를 설계할 때 유용한 스킬입니다. 멀티채널 알림 운영을 빠르게 붙이고 검증하는 데 적합합니다."
  },
  "awesome/better-auth/create-auth": {
    name_ko: "인증 생성",
    description_ko:
      "Better Auth 기반 인증 구성을 빠르게 시작할 수 있도록 돕는 스킬입니다. 초기 세팅과 핵심 구조를 잡을 때 쓰기 좋습니다."
  },
  "awesome/voltagent/create-voltagent": {
    name_ko: "볼트에이전트 생성",
    description_ko:
      "VoltAgent 프로젝트를 CLI 또는 수동 단계로 빠르게 시작할 수 있게 안내하는 스킬입니다. 기본 구조를 잡고 첫 실행 환경을 만드는 데 مناسب합니다."
  },
  "anthropics/skills/doc-coauthoring": {
    name_ko: "문서 공동작성",
    description_ko:
      "기획서, 제안서, 기술 문서처럼 구조 있는 문서를 함께 다듬고 완성할 때 유용한 스킬입니다. 문서 흐름을 정리하면서 협업 품질을 높이는 데 적합합니다."
  },
  "anthropics/skills/docx": {
    name_ko: "워드 문서",
    description_ko:
      "Word 문서를 만들거나 읽고 수정할 때 쓰는 문서 작업 스킬입니다. 목차, 서식, 이미지, 치환 같은 반복 작업을 구조적으로 처리할 수 있습니다."
  },
  "awesome/better-auth/explain-error": {
    name_ko: "에러 설명",
    description_ko:
      "Better Auth에서 발생한 에러 메시지를 해석하고 원인을 파악하는 데 도움 되는 스킬입니다. 문제 상황을 빠르게 이해하고 다음 조치를 정리할 때 유용합니다."
  },
  "vercel-labs/skills/find-skills": {
    name_ko: "스킬 찾기",
    description_ko:
      "필요한 기능에 맞는 에이전트 스킬을 찾고 설치 후보를 추천할 때 도움 되는 검색형 스킬입니다. 어떤 스킬을 써야 할지 빠르게 탐색할 때 유용합니다."
  },
  "anthropics/skills/frontend-design": {
    name_ko: "프론트엔드 디자인",
    description_ko:
      "UI 구조와 화면 완성도, 구현 품질까지 함께 끌어올리고 싶을 때 쓰는 스킬입니다. 랜딩 페이지나 컴포넌트를 더 완성도 있게 만들 때 적합합니다."
  },
  "awesome/google-gemini/gemini-api-dev": {
    name_ko: "Gemini API 개발",
    description_ko:
      "Gemini API를 활용한 앱을 개발할 때 필요한 구조와 모범 사례를 정리한 스킬입니다. 기본 통합부터 운영 패턴까지 빠르게 파악할 수 있습니다."
  },
  "awesome/google-gemini/gemini-interactions-api": {
    name_ko: "Gemini 인터랙션 API",
    description_ko:
      "텍스트, 채팅, 스트리밍, 이미지 생성 같은 상호작용 기능을 Gemini API로 구현할 때 도움 되는 스킬입니다. 대화형 앱 설계에 잘 맞습니다."
  },
  "awesome/google-gemini/gemini-live-api-dev": {
    name_ko: "Gemini 라이브 API 개발",
    description_ko:
      "실시간 양방향 스트리밍 앱을 Gemini Live API로 만들 때 유용한 스킬입니다. 반응성이 중요한 라이브 인터랙션 제품에 적합합니다."
  },
  "awesome/callstackincubator/github": {
    name_ko: "깃허브 워크플로",
    description_ko:
      "PR, 코드리뷰, 브랜치 전략 같은 GitHub 협업 흐름을 정리할 때 유용한 스킬입니다. 팀 개발 프로세스를 더 안정적으로 운영하는 데 적합합니다."
  },
  "anthropics/skills/internal-comms": {
    name_ko: "내부 커뮤니케이션",
    description_ko:
      "팀 공지, 상태 공유, FAQ, 프로젝트 업데이트 같은 내부 문서를 작성할 때 쓰기 좋은 스킬입니다. 회사 내 커뮤니케이션 형식을 빠르게 맞출 수 있습니다."
  },
  "anthropics/skills/mcp-builder": {
    name_ko: "MCP 빌더",
    description_ko:
      "외부 서비스와 연결되는 MCP 서버를 설계하고 구현할 때 필요한 흐름을 정리해주는 스킬입니다. 도구 설계와 통합 구조를 빠르게 잡는 데 적합합니다."
  },
  "anthropics/skills/pdf": {
    name_ko: "PDF 작업",
    description_ko:
      "PDF 읽기, 병합, 분리, 워터마크, OCR 같은 작업을 처리할 때 활용하는 스킬입니다. 문서 파일을 반복적으로 다뤄야 할 때 특히 유용합니다."
  },
  "awesome/supabase/postgres-best-practices": {
    name_ko: "Postgres 모범 사례",
    description_ko:
      "Supabase 환경에서 PostgreSQL을 더 안정적이고 효율적으로 운영하기 위한 실무 팁을 담은 스킬입니다. 스키마 설계와 쿼리 품질 개선에 적합합니다."
  },
  "anthropics/skills/pptx": {
    name_ko: "파워포인트",
    description_ko:
      "슬라이드 덱을 만들거나 읽고 수정할 때 쓰는 프레젠테이션 작업 스킬입니다. 발표 자료 구조화와 내용 정리에 유용합니다."
  },
  "awesome/better-auth/providers": {
    name_ko: "인증 제공자",
    description_ko:
      "Better Auth에서 사용할 인증 제공자 구성을 이해하고 선택할 때 참고하는 스킬입니다. 로그인 옵션과 공급자 연동을 정리할 때 도움이 됩니다."
  },
  "awesome/callstackincubator/react-native-best-practices": {
    name_ko: "리액트 네이티브 모범 사례",
    description_ko:
      "React Native 앱의 성능과 구조를 개선하기 위한 실전 패턴을 정리한 스킬입니다. 모바일 앱 최적화와 병목 점검에 적합합니다."
  },
  "anthropics/skills/skill-creator": {
    name_ko: "스킬 생성기",
    description_ko:
      "새로운 스킬을 만들거나 기존 스킬을 개선하고 평가할 때 사용하는 메타 스킬입니다. 스킬 설계 품질과 트리거 정확도를 높이는 데 적합합니다."
  },
  "anthropics/skills/slack-gif-creator": {
    name_ko: "슬랙 GIF 생성기",
    description_ko:
      "Slack에서 잘 동작하는 짧은 애니메이션 GIF를 만들 때 참고하는 스킬입니다. 최적화된 제약 조건과 제작 흐름을 함께 제공합니다."
  },
  "awesome/stripe/stripe-best-practices": {
    name_ko: "Stripe 모범 사례",
    description_ko:
      "Stripe 결제 연동을 설계하고 운영할 때 지켜야 할 모범 사례를 정리한 스킬입니다. 결제 구조와 결제 흐름 안정화에 도움이 됩니다."
  },
  "anthropics/skills/theme-factory": {
    name_ko: "테마 팩토리",
    description_ko:
      "문서, 슬라이드, 랜딩 페이지 같은 결과물에 일관된 테마를 적용할 때 사용하는 스킬입니다. 색상과 폰트 체계를 빠르게 맞출 수 있습니다."
  },
  "awesome/stripe/upgrade-stripe": {
    name_ko: "Stripe 업그레이드",
    description_ko:
      "Stripe SDK나 API 버전을 올릴 때 필요한 점검 항목과 마이그레이션 흐름을 정리한 스킬입니다. 결제 시스템 변경 리스크를 줄이는 데 적합합니다."
  },
  "awesome/callstackincubator/upgrading-react-native": {
    name_ko: "리액트 네이티브 업그레이드",
    description_ko:
      "React Native 버전을 올릴 때 템플릿, 의존성, 자주 발생하는 문제를 함께 점검하는 스킬입니다. 업그레이드 작업을 더 안전하게 진행할 수 있습니다."
  },
  "vercel-labs/agent-skills/react-best-practices": {
    name_ko: "Vercel React 모범 사례",
    description_ko:
      "React와 Next.js 코드에서 성능 병목과 구조 문제를 점검하고 모범 사례를 적용할 때 유용한 스킬입니다. Vercel 관점의 최적화 패턴을 빠르게 반영할 수 있습니다."
  },
  "awesome/google-gemini/vertex-ai-api-dev": {
    name_ko: "Vertex AI API 개발",
    description_ko:
      "Google Cloud Vertex AI에서 Gemini 기반 앱을 개발할 때 필요한 흐름을 정리한 스킬입니다. 클라우드 환경에서의 생성형 AI 통합에 적합합니다."
  },
  "awesome/voltagent/voltagent-best-practices": {
    name_ko: "VoltAgent 모범 사례",
    description_ko:
      "에이전트, 워크플로, 메모리, 서버 구조를 VoltAgent에 맞게 설계할 때 참고하는 스킬입니다. 전체 아키텍처 방향을 정리할 때 유용합니다."
  },
  "awesome/voltagent/voltagent-core-reference": {
    name_ko: "VoltAgent 코어 레퍼런스",
    description_ko:
      "VoltAgent 핵심 클래스의 옵션과 라이프사이클 메서드를 참고할 때 쓰는 스킬입니다. 구현 중 빠르게 API 구조를 확인하는 데 적합합니다."
  },
  "awesome/voltagent/voltagent-docs-bundle": {
    name_ko: "VoltAgent 문서 번들",
    description_ko:
      "현재 버전에 맞는 VoltAgent 문서를 빠르게 조회하고 참고할 때 유용한 스킬입니다. 버전 차이로 인한 혼선을 줄이는 데 도움이 됩니다."
  },
  "anthropics/skills/web-artifacts-builder": {
    name_ko: "웹 아티팩트 빌더",
    description_ko:
      "React, Tailwind, shadcn/ui 기반의 복합적인 HTML 아티팩트를 만들 때 쓰는 스킬입니다. 상태와 라우팅이 있는 고급 결과물 제작에 적합합니다."
  },
  "anthropics/skills/webapp-testing": {
    name_ko: "웹앱 테스트",
    description_ko:
      "Playwright 기반으로 로컬 웹앱을 테스트하고 UI 동작을 검증할 때 사용하는 스킬입니다. 반복 가능한 브라우저 테스트와 이슈 리포트 작성에 유용합니다."
  },
  "anthropics/skills/xlsx": {
    name_ko: "엑셀 작업",
    description_ko:
      "스프레드시트를 읽고 만들고 수정하는 작업을 처리할 때 사용하는 스킬입니다. 표 구조 정리, 수식 계산, 포맷 변환 같은 작업에 적합합니다."
  }
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

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function fetchSkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("source_id, public_id, name, name_ko, description_ko")
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
      description_ko: translation.description_ko,
      is_reviewed: true
    })
    .eq("source_id", skill.source_id);

  if (error) {
    throw error;
  }
}

async function main() {
  let skills;
  try {
    skills = await fetchSkills();
  } catch (error) {
    if (error?.code === "42703") {
      console.error("Supabase skills table is missing name_ko. Apply supabase/schema.sql first.");
      process.exit(1);
    }

    throw error;
  }
  const missing = skills.filter((skill) => !TRANSLATIONS[skill.source_id]);

  if (missing.length > 0) {
    console.error("Missing hardcoded translations for:");
    for (const skill of missing) {
      console.error(`- ${skill.source_id}`);
    }
    process.exit(1);
  }

  let updated = 0;

  for (const skill of skills) {
    const translation = TRANSLATIONS[skill.source_id];
    await updateSkillTranslation(skill, translation);
    updated += 1;
    console.log(`Updated ${skill.source_id}`);
  }

  const finalSkills = await fetchSkills();
  const completeNameCount = finalSkills.filter((skill) => skill.name_ko).length;
  const completeDescriptionCount = finalSkills.filter((skill) => skill.description_ko).length;

  console.log(
    JSON.stringify(
      {
        updated,
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
