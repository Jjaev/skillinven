import { fetchSkillMdRobust } from './fetch-skill-md';

interface FetchInput {
  sourceRepo: string;
  sourcePath: string;
}

export async function fetchSkillMd({ data }: { data: FetchInput }) {
  if (!data || typeof data.sourceRepo !== 'string' || typeof data.sourcePath !== 'string') {
    throw new Error('Invalid input');
  }

  return fetchSkillMdRobust(data.sourceRepo, data.sourcePath);
}
