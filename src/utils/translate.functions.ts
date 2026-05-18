interface TranslateInput {
  skillId: string; // public_id
  sourceRepo: string;
  sourcePath: string;
}

interface TranslateResult {
  ok: boolean;
  translated?: string;
  cached?: boolean;
  error?: string;
}

export async function translateSkill({ data }: { data: TranslateInput }): Promise<TranslateResult> {
  if (
    !data ||
    typeof data.skillId !== 'string' ||
    typeof data.sourceRepo !== 'string' ||
    typeof data.sourcePath !== 'string'
  ) {
    throw new Error('Invalid input');
  }

  return {
    ok: false,
    error: '정적 SPA 배포에서는 서버 번역 기능을 사용할 수 없습니다.',
  };
}
