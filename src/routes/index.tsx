import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing/LandingPage';
import { Toaster } from '@/components/ui/sonner';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: '스킬학교 — 한국 AI CLI 스킬 디렉토리' },
      { name: 'description', content: 'Claude · Codex · Gemini를 위한 검증된 한국어 AI 스킬 모음. 복사해서 바로 적용하세요. 84개 스킬 · 32명 기여자.' },
      { name: 'keywords', content: 'AI 스킬, Claude 스킬, Codex 스킬, Gemini 스킬, AI CLI, 한국어 AI, 프롬프트, AI 자동화' },
      { property: 'og:title', content: '스킬학교 — 한국 AI CLI 스킬 디렉토리' },
      { property: 'og:description', content: '검증된 한국어 AI 스킬을 찾고, 공유하고, 토론하세요.' },
      { property: 'og:url', content: 'https://skillschool.vercel.app/' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'canonical', href: 'https://skillschool.vercel.app/' },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <LandingPage />
      <Toaster />
    </>
  );
}
