/**
 * GitHub raw 파일을 안정적으로 가져오는 유틸.
 * - default branch가 main/master 둘 중 무엇이든 처리
 * - SKILL.md 없으면 README.md로 fallback
 * - 폴더 경로(예: "review/SKILL.md")와 루트 경로 둘 다 지원
 */

const BRANCHES = ['main', 'master'];
const FILE_CANDIDATES = ['SKILL.md', 'README.md', 'readme.md'];

export interface FetchedSkillMd {
  ok: boolean;
  text?: string;
  resolvedUrl?: string;
  error?: string;
  status?: number;
}

function buildCandidates(sourceRepo: string, sourcePath: string): string[] {
  const urls: string[] = [];
  // 사용자가 지정한 경로를 양쪽 브랜치로 우선 시도
  for (const branch of BRANCHES) {
    urls.push(`https://raw.githubusercontent.com/${sourceRepo}/${branch}/${sourcePath}`);
  }
  // 경로의 폴더 부분 추출 → 다른 파일명으로도 시도
  const folder = sourcePath.includes('/') ? sourcePath.slice(0, sourcePath.lastIndexOf('/')) : '';
  for (const branch of BRANCHES) {
    for (const file of FILE_CANDIDATES) {
      const path = folder ? `${folder}/${file}` : file;
      const url = `https://raw.githubusercontent.com/${sourceRepo}/${branch}/${path}`;
      if (!urls.includes(url)) urls.push(url);
    }
  }
  return urls;
}

export async function fetchSkillMdRobust(
  sourceRepo: string,
  sourcePath: string,
): Promise<FetchedSkillMd> {
  const candidates = buildCandidates(sourceRepo, sourcePath);
  let lastStatus = 0;
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const text = await r.text();
        return { ok: true, text, resolvedUrl: url };
      }
      lastStatus = r.status;
    } catch {
      // 네트워크 에러는 다음 후보로
    }
  }
  return { ok: false, error: `SKILL.md를 찾지 못했습니다 (${lastStatus || 'network error'})`, status: lastStatus };
}
