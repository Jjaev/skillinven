import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-all hover:border-lavender/50 hover:text-foreground ${className ?? ''}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
