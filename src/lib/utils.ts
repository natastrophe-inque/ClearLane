import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(dateStr)
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

export function badgeTierColor(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
  switch (tier) {
    case 'bronze': return 'from-amber-700 to-amber-600'
    case 'silver': return 'from-gray-400 to-gray-300'
    case 'gold': return 'from-yellow-500 to-amber-400'
    case 'platinum': return 'from-cyan-400 to-blue-400'
  }
}

export function difficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

export function xpProgressPercent(xp: number, xpToNext: number): number {
  if (xpToNext === 0) return 100
  return Math.round((xp / xpToNext) * 100)
}

export function confidenceLabel(score: number): string {
  if (score >= 90) return 'Road Ready'
  if (score >= 80) return 'Confident'
  if (score >= 65) return 'Building'
  if (score >= 50) return 'Learning'
  return 'Getting Started'
}
