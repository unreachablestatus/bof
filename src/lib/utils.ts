import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tarih formatını düzenle
 * @param dateString Tarih string'i
 * @param withTime Saat bilgisiyle birlikte mi (varsayılan: true)
 * @returns Düzenlenmiş tarih
 */
export function formatDate(dateString: string, withTime: boolean = true): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
