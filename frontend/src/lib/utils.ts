import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatBytes(kb: number): string {
  if (kb >= 1024 * 1024) {
    return (kb / (1024 * 1024)).toFixed(1) + ' GB'
  }
  if (kb >= 1024) {
    return (kb / 1024).toFixed(1) + ' MB'
  }
  return kb.toFixed(0) + ' KB'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // Green
  if (score >= 50) return '#eab308' // Yellow
  return '#ef4444' // Red
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    spam: '#ef4444',
    shopping: '#f97316',
    social: '#06b6d4',
    promotions: '#eab308',
    newsletters: '#22c55e',
    finance: '#3b82f6',
    updates: '#a855f7',
    unknown: '#64748b',
  }
  return colors[category] || colors.unknown
}
