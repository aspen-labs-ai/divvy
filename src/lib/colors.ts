export const AVATAR_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#a855f7',
] as const

export function getNextColor(usedColors: string[]): string {
  const available = AVATAR_COLORS.find((c) => !usedColors.includes(c))
  // If all colors are used, cycle back from the start
  return available ?? AVATAR_COLORS[usedColors.length % AVATAR_COLORS.length]
}
