import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves Tailwind conflicts, so a variant's base
 * classes can always be overridden by a caller's `className` prop rather than
 * both landing in the DOM and the winner being decided by stylesheet order.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
