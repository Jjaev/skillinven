export const STATUS_OPTIONS = [
  'New',
  'Under Review',
  'Planned',
  'In Progress',
  'Shipped',
  'Declined',
] as const;

export type FeatureStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_CONFIG: Record<FeatureStatus, { label: string; colorClass: string; bgClass: string }> = {
  'New': { label: '신규', colorClass: 'text-status-new', bgClass: 'bg-status-new/10' },
  'Under Review': { label: '검토 중', colorClass: 'text-status-review', bgClass: 'bg-status-review/10' },
  'Planned': { label: '예정', colorClass: 'text-status-planned', bgClass: 'bg-status-planned/10' },
  'In Progress': { label: '진행 중', colorClass: 'text-status-progress', bgClass: 'bg-status-progress/10' },
  'Shipped': { label: '배포됨', colorClass: 'text-status-shipped', bgClass: 'bg-status-shipped/10' },
  'Declined': { label: '거절됨', colorClass: 'text-status-declined', bgClass: 'bg-status-declined/10' },
};

export const CATEGORY_OPTIONS = [
  '개발·기술',
  '문서·자동화',
  '크리에이티브',
  '국산스킬',
  '데이터',
  '기타',
] as const;

export const COMPATIBLE_CLIS = ['claude', 'codex', 'gemini'] as const;
export type CompatibleCli = (typeof COMPATIBLE_CLIS)[number];

export const CLI_LABELS: Record<CompatibleCli, string> = {
  claude: 'Claude',
  codex: 'Codex',
  gemini: 'Gemini',
};
