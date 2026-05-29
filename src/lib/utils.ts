import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(amount: string | number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export const PLAN_COLORS: Record<string, string> = {
  free:     'bg-gray-100 text-gray-700',
  starter:  'bg-blue-100 text-blue-700',
  pro:      'bg-violet-100 text-violet-700',
  business: 'bg-amber-100 text-amber-700',
}
