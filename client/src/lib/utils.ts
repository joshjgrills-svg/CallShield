import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-500';
  if (score >= 50) return 'text-orange-500';
  if (score >= 30) return 'text-yellow-500';
  return 'text-green-500';
}

export function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    spam: 'bg-red-500/10 text-red-500 border-red-500/20',
    scam: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    telemarketer: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    legitimate: 'bg-green-500/10 text-green-500 border-green-500/20',
    unknown: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return colors[category] || colors.unknown;
}
