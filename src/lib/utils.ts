import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const time = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', { hour12: false })
export const date = (value: string) => new Date(value).toLocaleDateString('vi-VN')
