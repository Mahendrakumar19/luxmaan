import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number, max?: number, currency = "EUR"): string {
  if (!min && !max) return "Competitive";
  if (min && max) return `€${(min / 1000).toFixed(0)}k - €${(max / 1000).toFixed(0)}k`;
  if (min) return `From €${(min / 1000).toFixed(0)}k`;
  return `Up to €${(max! / 1000).toFixed(0)}k`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateString;
  }
}
