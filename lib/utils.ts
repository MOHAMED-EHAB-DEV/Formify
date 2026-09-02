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
