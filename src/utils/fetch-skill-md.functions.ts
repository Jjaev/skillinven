/**
 * Server function: SKILL.md를 fallback 체인으로 안정적으로 가져옴.
 * raw.githubusercontent.com이 main/master 어느 브랜치든, SKILL.md/README.md 어느 파일이든 시도.
 */
import { createServerFn } from '@tanstack/react-start';
import { fetchSkillMdRobust } from './fetch-skill-md';

interface FetchInput {
  sourceRepo: string;
  sourcePath: string;
}

export const fetchSkillMd = createServerFn({ method: 'POST' })
  .inputValidator((data: FetchInput) => {
    if (!data || typeof data.sourceRepo !== 'string' || typeof data.sourcePath !== 'string') {
      throw new Error('Invalid input');
    }
    return data;
  })
  .handler(async ({ data }) => {
    const result = await fetchSkillMdRobust(data.sourceRepo, data.sourcePath);
    return result;
  });
