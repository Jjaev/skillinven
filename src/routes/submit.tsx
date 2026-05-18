import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SKILL_CATEGORIES, SKILL_CLIS, SKILL_CLI_LABELS, type SkillCli } from '@/lib/skills';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/submit')({
  head: () => ({
    meta: [
      { title: '스킬 제출 — 스킬학교' },
      { name: 'description', content: '내가 만든 AI CLI 스킬을 스킬학교에 등록 신청하세요.' },
    ],
  }),
  component: SubmitPage,
});

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || 'skill'}-${suffix}`;
}

function parseRepo(url: string): { repo: string; path: string } {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const repo = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '';
    const rest = parts.slice(4).join('/'); // skip /tree/<branch>
    return { repo, path: rest || 'SKILL.md' };
  } catch {
    return { repo: '', path: 'SKILL.md' };
  }
}

function SubmitPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [clis, setClis] = useState<SkillCli[]>([]);
  const [submitter, setSubmitter] = useState('');

  const toggleCli = (cli: SkillCli, checked: boolean) => {
    setClis(prev => (checked ? [...new Set([...prev, cli])] : prev.filter(c => c !== cli)));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || !name.trim() || !description.trim()) {
      toast.error('필수 항목을 모두 채워주세요.');
      return;
    }
    if (!githubUrl.includes('github.com')) {
      toast.error('GitHub URL을 입력해주세요.');
      return;
    }
    if (description.length > 100) {
      toast.error('한 줄 설명은 100자 이내로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const { repo, path } = parseRepo(githubUrl.trim());
    const author = submitter.trim() || (repo ? repo.split('/')[0] : 'anonymous');

    const { error } = await supabase.from('skills').insert({
      public_id: slugify(name),
      name,
      name_ko: name,
      description_ko: description,
      description_en: description,
      github_url: githubUrl.trim(),
      source_repo: repo,
      source_path: path,
      author,
      category: category || null,
      compatible_with: clis,
      is_reviewed: false,
    });

    setSubmitting(false);
    if (error) {
      toast.error('제출 실패: ' + error.message);
      return;
    }
    toast.success('등록 신청이 완료됐어요! 검토 후 반영됩니다.');
    setTimeout(() => navigate({ to: '/' }), 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> 홈으로
        </Link>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-lavender">SUBMIT</p>
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">스킬 제출</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          만든 스킬의 GitHub 링크와 설명을 알려주세요. 검토 후 디렉토리에 반영됩니다.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[16px] border border-border/60 bg-card p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL <span className="text-destructive">*</span></Label>
            <Input
              id="github_url"
              type="url"
              placeholder="https://github.com/user/repo/tree/main/skills/my-skill"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">스킬 이름 <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="예: 코드 리뷰 봇"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">한 줄 설명 <span className="text-destructive">*</span></Label>
            <Input
              id="description"
              placeholder="이 스킬이 무엇을 하는지 한 줄로"
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">{description.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>호환 도구</Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {SKILL_CLIS.map(cli => (
                <label key={cli} className="inline-flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={clis.includes(cli)}
                    onCheckedChange={(v) => toggleCli(cli, !!v)}
                  />
                  <span className="text-sm text-foreground">{SKILL_CLI_LABELS[cli]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitter">제출자 GitHub 닉네임 <span className="text-muted-foreground text-xs">(선택)</span></Label>
            <Input
              id="submitter"
              placeholder="예: octocat"
              value={submitter}
              onChange={(e) => setSubmitter(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-lavender text-foreground hover:bg-lavender/90">
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 제출 중...</>
            ) : (
              '등록 신청하기'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
