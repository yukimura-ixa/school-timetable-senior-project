import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for composing Tailwind CSS classes with proper precedence and deduplication.
 *
 * Combines `clsx` for conditional class handling with `tailwind-merge` for
 * intelligent merging of conflicting Tailwind utilities.
 *
 * @example
 * ```tsx
 * // Conditional classes
 * cn("base-class", isActive && "active-class", "another-class")
 * // => "base-class active-class another-class"
 *
 * // Conflicting utilities (last one wins)
 * cn("px-4 py-2", "px-6")
 * // => "py-2 px-6"
 *
 * // Object syntax
 * cn({
 *   "text-blue-500": isPrimary,
 *   "text-red-500": isError,
 * })
 * ```
 *
 * @param inputs - Class values to compose (strings, objects, arrays, booleans, null, undefined)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
