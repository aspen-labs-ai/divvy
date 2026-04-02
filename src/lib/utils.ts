import { customAlphabet } from 'nanoid'

// 6-char alphanumeric, URL-safe trip codes (no ambiguous chars like 0/O, 1/I)
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

export function generateTripCode(): string {
  return nanoid()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// 12 distinct colors for member avatars
export const AVATAR_COLORS = [
  '#22c55e', // green (primary accent)
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#a855f7', // purple
  '#e11d48', // rose
] as const

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export function getNextAvatarColor(existingMembers: { avatar_color: string }[]): string {
  const used = new Set(existingMembers.map((m) => m.avatar_color))
  const next = AVATAR_COLORS.find((c) => !used.has(c))
  return next ?? AVATAR_COLORS[existingMembers.length % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
