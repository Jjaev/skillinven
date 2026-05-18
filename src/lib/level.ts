export interface UserLevel {
  name: string;
  min: number;
  next: number | null;
  emoji: string;
}

export function getLevel(savedCount: number): UserLevel {
  if (savedCount >= 20) return { name: '교수', min: 20, next: null, emoji: '🎓' };
  if (savedCount >= 10) return { name: '우등생', min: 10, next: 20, emoji: '🏆' };
  if (savedCount >= 5) return { name: '수강생', min: 5, next: 10, emoji: '📚' };
  if (savedCount >= 1) return { name: '새내기', min: 1, next: 5, emoji: '🌱' };
  return { name: '입학생', min: 0, next: 1, emoji: '🎒' };
}
