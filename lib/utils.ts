import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function camelize(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function isBase64Image(imageData: string): boolean {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(imageData);
}

export function formatDate(date: Date | string | number | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function truncateFileName(name: string, maxLength = 24): string {
  if (!name || name.length <= maxLength) return name;
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0 || name.length - lastDot > 8) {
    return `${name.slice(0, Math.max(1, maxLength - 3))}...`;
  }
  const ext = name.slice(lastDot);
  const base = name.slice(0, lastDot);
  const available = maxLength - ext.length - 3;
  if (available <= 3) {
    return `${name.slice(0, Math.max(1, maxLength - 3))}...`;
  }
  const frontChars = Math.ceil(available * 0.6);
  const backChars = available - frontChars;
  if (backChars > 0) {
    return `${base.slice(0, frontChars)}...${base.slice(-backChars)}${ext}`;
  }
  return `${base.slice(0, available)}...${ext}`;
}
