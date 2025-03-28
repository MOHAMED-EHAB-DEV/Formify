import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function camelize(str: string) {
  const firstChar = str[0].toUpperCase();
  return str.replace(firstChar.toLowerCase(), firstChar)
}