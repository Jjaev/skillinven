/** Increments saves count for a skill identified by its public_id. */
export async function incrementSkillSave({ data }: { data: { publicId: string } }) {
  if (!data?.publicId) {
    return { ok: false as const, error: 'Skill not found' };
  }

  return {
    ok: false as const,
    error: '정적 SPA 배포에서는 서버 저장 카운트 기능을 사용할 수 없습니다.',
  };
}
